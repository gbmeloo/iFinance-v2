import jwt
import re

from flask import jsonify, g, request
from functools import wraps


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"message": "Access denied"}), 400

        try:
            # Decode the token
            data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])
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