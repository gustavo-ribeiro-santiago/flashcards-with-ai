# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app

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
# import firebase_admin
# from firebase_admin import credentials, firestore
# from openai import OpenAI
import os
# import json
# from flask import jsonify

# # Initialize Firebase Admin SDK
# if not firebase_admin._apps:
#     cred = credentials.ApplicationDefault()
#     firebase_admin.initialize_app(cred)

# db = firestore.client()

# Get OpenAI API key from environment (Firebase will inject config as env vars)
# def get_openai_key():
#     # Try different environment variable formats
#     return (os.environ.get('OPENAI_API_KEY') or 
#             os.environ.get('openai_api_key') or
#             os.environ.get('OPENAI.API_KEY'))

# openai_client = OpenAI(api_key=get_openai_key())

# @functions_framework.http
# def generate_flashcards(request):
#     """
#     Cloud Function to generate flashcards using OpenAI GPT
#     """
#     # Handle CORS
#     if request.method == 'OPTIONS':
#         headers = {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Methods': 'POST',
#             'Access-Control-Allow-Headers': 'Content-Type, Authorization',
#             'Access-Control-Max-Age': '3600'
#         }
#         return ('', 204, headers)
    
#     # Set CORS headers for main request
#     headers = {
#         'Access-Control-Allow-Origin': '*',
#         'Access-Control-Allow-Headers': 'Content-Type',
#     }
    
#     try:
#         # Check if OpenAI client is configured
#         if not openai_client.api_key:
#             return jsonify({'error': 'OpenAI API key not found'}), 500
        
#         # Get request data
#         data = request.get_json()
#         if not data:
#             return jsonify({'error': 'No data provided'}), 400
        
#         theme = data.get('theme')
#         num_cards = data.get('num_cards', 10)
#         language = data.get('language', 'pt')
#         user_id = data.get('user_id')
        
#         if not theme or not user_id:
#             return jsonify({'error': 'Theme and user_id are required'}), 400
        
#         # Validate number of cards
#         if num_cards > 50:
#             num_cards = 50
#         elif num_cards < 1:
#             num_cards = 1
        
#         # Create prompt based on language
#         if language == 'en':
#             prompt = f"""Generate {num_cards} flashcards about the following theme: {theme}. 
#             Return a JSON object with the following structure:
#             {{
#                 "flashcards": [
#                     {{
#                         "front": "Question or concept",
#                         "back": "Answer or explanation"
#                     }}
#                 ]
#             }}
            
#             Make sure the flashcards are educational, accurate, and well-formatted.
#             Focus on key concepts, definitions, and important facts about {theme}.
#             """
#         else:
#             prompt = f"""Gere {num_cards} flashcards sobre o seguinte tema: {theme}. 
#             Retorne um objeto JSON com a seguinte estrutura:
#             {{
#                 "flashcards": [
#                     {{
#                         "front": "Pergunta ou conceito",
#                         "back": "Resposta ou explicação"
#                     }}
#                 ]
#             }}
            
#             Certifique-se de que os flashcards sejam educativos, precisos e bem formatados.
#             Foque em conceitos-chave, definições e fatos importantes sobre {theme}.
#             Responda em português.
#             """
        
#         # Call OpenAI API
#         response = openai_client.chat.completions.create(
#             model="gpt-5-mini",
#             messages=[
#                 {"role": "system", "content": "You are a helpful educational assistant that creates high-quality flashcards."},
#                 {"role": "user", "content": prompt}
#             ],
#             # temperature=0.7,
#             # max_tokens=2000
#         )
        
#         # Parse the response
#         content = response.choices[0].message.content
        
#         # Try to extract JSON from the response
#         try:
#             # Find JSON in the response
#             start = content.find('{')
#             end = content.rfind('}') + 1
#             json_str = content[start:end]
#             flashcards_data = json.loads(json_str)
#         except:
#             # If JSON parsing fails, return an error
#             return jsonify({'error': 'Failed to parse AI response'}), 500
        
#         # Validate the structure
#         if 'flashcards' not in flashcards_data:
#             return jsonify({'error': 'Invalid response structure from AI'}), 500
        
#         return (jsonify(flashcards_data), 200, headers)
        
#     except Exception as e:
#         print(f"Error generating flashcards: {str(e)}")
#         return (jsonify({'error': 'Internal server error'}), 500, headers)

# @functions_framework.http
# def save_performance(request):
#     """
#     Cloud Function to save user performance data
#     """
#     # Handle CORS
#     if request.method == 'OPTIONS':
#         headers = {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Methods': 'POST',
#             'Access-Control-Allow-Headers': 'Content-Type, Authorization',
#             'Access-Control-Max-Age': '3600'
#         }
#         return ('', 204, headers)
    
#     # Set CORS headers for main request
#     headers = {
#         'Access-Control-Allow-Origin': '*',
#         'Access-Control-Allow-Headers': 'Content-Type',
#     }
    
#     try:
#         data = request.get_json()
#         if not data:
#             return (jsonify({'error': 'No data provided'}), 400, headers)
        
#         required_fields = ['user_id', 'class_id', 'accuracy', 'completion_time', 'correct_answers', 'total_questions', 'card_errors']
        
#         for field in required_fields:
#             if field not in data:
#                 return (jsonify({'error': f'Missing required field: {field}'}), 400, headers)
        
#         # Prepare performance document
#         performance_data = {
#             'userId': data['user_id'],
#             'classId': data['class_id'],
#             'accuracy': data['accuracy'],
#             'completionTime': data['completion_time'],
#             'correctAnswers': data['correct_answers'],
#             'totalQuestions': data['total_questions'],
#             'cardErrors': data['card_errors'],  # Array of card IDs with errors
#             'completedAt': firestore.SERVER_TIMESTAMP
#         }
        
#         # Save to Firestore
#         doc_ref = db.collection('performance').add(performance_data)
        
#         return (jsonify({
#             'success': True,
#             'performance_id': doc_ref[1].id
#         }), 200, headers)
        
#     except Exception as e:
#         print(f"Error saving performance: {str(e)}")
#         return (jsonify({'error': 'Internal server error'}), 500, headers)