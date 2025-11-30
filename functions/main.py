# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, firestore, credentials
import logging

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)

# initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


# import functions_framework
import firebase_admin
# from firebase_admin import credentials, firestore
# from openai import OpenAI
import os
from dotenv import load_dotenv

from openai import OpenAI

load_dotenv()

def get_openai_key():
    return os.getenv('OPENAI_API_KEY')

openai_client = OpenAI(api_key=get_openai_key())

# import json
# from flask import jsonify

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate("key.json"))

db = firestore.client()

from google.cloud import logging as cloud_logging

# Ativa integração do Python logging com Cloud Logging
client = cloud_logging.Client()
client.setup_logging()  # <-- ESSENCIAL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get OpenAI API key from environment (Firebase will inject config as env vars)
# def get_openai_key():
#     # Try different environment variable formats
#     return (os.environ.get('OPENAI_API_KEY') or 
#             os.environ.get('openai_api_key') or
#             os.environ.get('OPENAI.API_KEY'))

# openai_client = OpenAI(api_key=get_openai_key())

import json

@https_fn.on_request(timeout_sec=300)
def generate_flashcards(req: https_fn.Request) -> https_fn.Response:
    # return https_fn.Response("Hello world!")
    """
    Cloud Function to generate flashcards using OpenAI GPT
    """
    logger.info("=== Starting generate_flashcards function ===")
    logger.info(f"Request method: {req.method}")
    logger.info(f"Request headers: {dict(req.headers)}")
    
    # Handle CORS
    if req.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        logger.info("Handling CORS preflight request")
        return https_fn.Response(
            '', status=204, headers=headers
        )
    
    # Set CORS headers for main request
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
    
    logger.info("Processing main request")
    
    try:
        # # Check if OpenAI client is configured
        # if not openai_client.api_key:
        #     return https_fn.Response(
        #         json.dumps({'error': 'OpenAI API key not found'}),
        #         status=500, headers={**headers, 'Content-Type': 'application/json'}
        #     )
        
        # Get request data
        logger.info("Attempting to parse request JSON data")
        try:
            data = req.get_json()
            logger.info(f"Successfully parsed JSON data: {data}")
        except Exception as e:
            logger.error(f"Failed to parse JSON data: {str(e)}")
            data = None
        
        if not data:
            logger.error("No data provided in request")
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}),
                status=400, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        theme = data.get('theme')
        num_cards = data.get('num_cards', 10)
        language = data.get('language', 'pt')
        user_id = data.get('user_id')
        
        logger.info(f"Extracted parameters - theme: {theme}, num_cards: {num_cards}, language: {language}, user_id: {user_id}")
        
        if not theme or not user_id:
            logger.error(f"Missing required parameters - theme: {theme}, user_id: {user_id}")
            return https_fn.Response(
                json.dumps({'error': 'Theme and user_id are required'}),
                status=400, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        # Validate number of cards
        original_num_cards = num_cards
        if num_cards > 50:
            num_cards = 50
        elif num_cards < 1:
            num_cards = 1
        
        if original_num_cards != num_cards:
            logger.info(f"Adjusted num_cards from {original_num_cards} to {num_cards}")
        else:
            logger.info(f"Using num_cards: {num_cards}")
        
        # Create prompt based on language
        logger.info(f"Creating prompt for language: {language}")
        if language == 'en':
            prompt = f"""Generate {num_cards} flashcards with the following theme/guidelines: {theme}. 
            Return a JSON object with the following structure:
            {{
                "flashcards": [
                    {{
                        "front": "Question or concept",
                        "back": "Answer or explanation"
                    }}
                ]
            }}
            
            Make sure the flashcards are educational, accurate, and well-formatted.
            Focus on following the theme/guidelines: {theme}.
            """
        else:
            prompt = f"""Gere {num_cards} flashcards com o seguinte tema/guidelines: {theme}. 
            Retorne um objeto JSON com a seguinte estrutura:
            {{
                "flashcards": [
                    {{
                        "front": "Pergunta ou conceito",
                        "back": "Resposta ou explicação"
                    }}
                ]
            }}
            
            Certifique-se de que os flashcards sejam educativos, precisos e bem formatados.
            Foque em seguir o tema/guidelines: {theme}.
            Responda em português.
            """
        
        logger.info(f"Generated prompt (first 200 chars): {prompt[:200]}...")
        
        # Call OpenAI API
        logger.info("Making OpenAI API call")
        logger.info(f"OpenAI client configured: {openai_client.api_key is not None}")
        
        try:
            # response = openai_client.chat.completions.create(
            #     model="gpt-5-mini",
            #     messages=[
            #         {"role": "system", "content": "You are a helpful educational assistant that creates high-quality flashcards."},
            #         {"role": "user", "content": prompt}
            #     ],
            #     # temperature=0.7,
            #     # max_tokens=2000
            # )

            # Use Responses API with web_search tool
            response = openai_client.responses.create(
                model="gpt-5-mini",                    # or another model with web search support
                tools=[
                    { "type": "web_search" }
                ],
                input=prompt
            )
            logger.info("OpenAI API call successful")
            logger.info(f"Response usage: {response.usage}")
            
        except Exception as openai_error:
            logger.error(f"OpenAI API call failed: {str(openai_error)}")
            logger.error(f"OpenAI error type: {type(openai_error).__name__}")
            return https_fn.Response(
                json.dumps({'error': f'OpenAI API error: {str(openai_error)}'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        # Parse the response
        # content = response.choices[0].message.content
        content = response.output_text
        logger.info(f"OpenAI response content (first 500 chars): {content[:500]}...")
        logger.info(f"Full response content length: {len(content)}")
        
        # Try to extract JSON from the response
        logger.info("Attempting to extract JSON from AI response")
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            logger.info(f"JSON extraction - start: {start}, end: {end}")
            
            if start == -1 or end == 0:
                logger.error("No JSON structure found in response")
                return https_fn.Response(
                    json.dumps({'error': 'No JSON structure found in AI response'}),
                    status=500, headers={**headers, 'Content-Type': 'application/json'}
                )
            
            json_str = content[start:end]
            logger.info(f"Extracted JSON string (first 200 chars): {json_str[:200]}...")
            
            flashcards_data = json.loads(json_str)
            logger.info("Successfully parsed JSON from AI response")
            logger.info(f"Flashcards data keys: {list(flashcards_data.keys())}")
            
        except json.JSONDecodeError as json_error:
            logger.error(f"JSON decode error: {str(json_error)}")
            logger.error(f"Failed to parse JSON string: {json_str[:200]}...")
            return https_fn.Response(
                json.dumps({'error': 'Failed to parse AI response as JSON'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        except Exception as parse_error:
            logger.error(f"General parsing error: {str(parse_error)}")
            logger.error(f"Error type: {type(parse_error).__name__}")
            return https_fn.Response(
                json.dumps({'error': 'Failed to parse AI response'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        # Validate the structure
        logger.info("Validating flashcards data structure")
        if 'flashcards' not in flashcards_data:
            logger.error(f"Missing 'flashcards' key in response. Available keys: {list(flashcards_data.keys())}")
            return https_fn.Response(
                json.dumps({'error': 'Invalid response structure from AI'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        flashcards_count = len(flashcards_data.get('flashcards', []))
        logger.info(f"Successfully generated {flashcards_count} flashcards")
        
        # Validate each flashcard has required fields
        for i, card in enumerate(flashcards_data['flashcards']):
            if 'front' not in card or 'back' not in card:
                logger.error(f"Flashcard {i} missing required fields. Card: {card}")
                return https_fn.Response(
                    json.dumps({'error': f'Flashcard {i} missing required fields'}),
                    status=500, headers={**headers, 'Content-Type': 'application/json'}
                )
        
        logger.info("=== Successfully completed generate_flashcards function ===")
        return https_fn.Response(
            json.dumps(flashcards_data),
            status=200, headers={**headers, 'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        logger.error(f"=== UNEXPECTED ERROR in generate_flashcards ===")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error(f"Error args: {e.args}")
        
        # Log the full traceback for debugging
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Also print for Cloud Functions logs (backup)
        print(f"Error generating flashcards: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        
        return https_fn.Response(
            json.dumps({'error': 'Internal server error', 'details': str(e)}),
            status=500, headers={**headers, 'Content-Type': 'application/json'}
        )

@https_fn.on_request()
def save_performance(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to save user performance data
    """
    # Handle CORS
    if req.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return https_fn.Response(
            '', status=204, headers=headers
        )
    
    # Set CORS headers for main request
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    try:
        try:
            data = req.get_json()
        except Exception:
            data = None
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}),
                status=400, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        required_fields = [
            'user_id', 'class_id', 'accuracy', 
            'completion_time', 'correct_answers', 
            'total_questions', 'card_errors'
        ]
        
        for field in required_fields:
            if field not in data:
                return https_fn.Response(
                    json.dumps({'error': f'Missing required field: {field}'}),
                    status=400, headers={**headers, 'Content-Type': 'application/json'}
                )
        
        # Prepare performance document
        performance_data = {
            'userId': data['user_id'],
            'classId': data['class_id'],
            'accuracy': data['accuracy'],
            'completionTime': data['completion_time'],
            'correctAnswers': data['correct_answers'],
            'totalQuestions': data['total_questions'],
            'cardErrors': data['card_errors'],  # Array of card IDs with errors
            'completedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Save to Firestore
        doc_ref = db.collection('performance').add(performance_data)
        
        return https_fn.Response(
            json.dumps({
                'success': True,
                'performance_id': doc_ref[1].id
            }),
            status=200, headers={**headers, 'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Error saving performance: {str(e)}")
        return https_fn.Response(
            json.dumps({'error': 'Internal server error'}),
            status=500, headers={**headers, 'Content-Type': 'application/json'}
        )