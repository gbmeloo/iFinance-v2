import jwt
import re
import os
from dotenv import load_dotenv

from flask import jsonify, g, request, make_response
from functools import wraps

# Load environment variables from .env file
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return make_response(('', 204))

        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"message": "Access denied"}), 400

        try:
            # Decode the token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            g.admin = data.get("admin", 0)
            
            # Admin check can be done within the protected routes
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 402
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 403

        return f(*args, **kwargs)
    
    return decorated



def check_name_field(input):
    # Definindo o padrão para o campo nome
    pattern = re.compile(r'^[A-Za-z\s\^~áç`]{1,50}$')

    match = pattern.match(input)

    return bool(match)


def validate_password(input):
    # Validação da senha
    pattern = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$')

    match = pattern.match(input)

    return bool(match)

def validate_username(input):
    # Validação nome de usuário
    pattern = re.compile(r'^[A-Za-z\d]{1,20}$')

    match = pattern.match(input)

    return bool(match)

def validate_name_50char(input):
    # Definindo o padrão para o campo nome
    pattern = re.compile(r'^[A-Za-z\s]{1,50}$')

    match = pattern.match(input)

    return bool(match)