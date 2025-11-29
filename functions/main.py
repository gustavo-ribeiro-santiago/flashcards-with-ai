# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, firestore, credentials

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)

initialize_app()


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

# Get OpenAI API key from environment (Firebase will inject config as env vars)
# def get_openai_key():
#     # Try different environment variable formats
#     return (os.environ.get('OPENAI_API_KEY') or 
#             os.environ.get('openai_api_key') or
#             os.environ.get('OPENAI.API_KEY'))

# openai_client = OpenAI(api_key=get_openai_key())

import json

@https_fn.on_request()
def generate_flashcards(req: https_fn.Request) -> https_fn.Response:
    # return https_fn.Response("Hello world!")
    """
    Cloud Function to generate flashcards using OpenAI GPT
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
    
    try:
        # # Check if OpenAI client is configured
        # if not openai_client.api_key:
        #     return https_fn.Response(
        #         json.dumps({'error': 'OpenAI API key not found'}),
        #         status=500, headers={**headers, 'Content-Type': 'application/json'}
        #     )
        
        # Get request data
        try:
            data = req.get_json()
        except Exception:
            data = None
        if not data:
            return https_fn.Response(
                json.dumps({'error': 'No data provided'}),
                status=400, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        theme = data.get('theme')
        num_cards = data.get('num_cards', 10)
        language = data.get('language', 'pt')
        user_id = data.get('user_id')
        
        if not theme or not user_id:
            return https_fn.Response(
                json.dumps({'error': 'Theme and user_id are required'}),
                status=400, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        # Validate number of cards
        if num_cards > 50:
            num_cards = 50
        elif num_cards < 1:
            num_cards = 1
        
        # Create prompt based on language
        if language == 'en':
            prompt = f"""Generate {num_cards} flashcards about the following theme: {theme}. 
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
            Focus on key concepts, definitions, and important facts about {theme}.
            """
        else:
            prompt = f"""Gere {num_cards} flashcards sobre o seguinte tema: {theme}. 
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
            Foque em conceitos-chave, definições e fatos importantes sobre {theme}.
            Responda em português.
            """
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant that creates high-quality flashcards."},
                {"role": "user", "content": prompt}
            ],
            # temperature=0.7,
            # max_tokens=2000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            json_str = content[start:end]
            flashcards_data = json.loads(json_str)
        except Exception:
            return https_fn.Response(
                json.dumps({'error': 'Failed to parse AI response'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        # Validate the structure
        if 'flashcards' not in flashcards_data:
            return https_fn.Response(
                json.dumps({'error': 'Invalid response structure from AI'}),
                status=500, headers={**headers, 'Content-Type': 'application/json'}
            )
        
        return https_fn.Response(
            json.dumps(flashcards_data),
            status=200, headers={**headers, 'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Error generating flashcards: {str(e)}")
        return https_fn.Response(
            json.dumps({'error': 'Internal server error'}),
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