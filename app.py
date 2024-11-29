import jwt
import logging

from datetime import date, datetime, timedelta
from flask import Flask, jsonify, request, g
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import token_required, check_name_field, validate_password, validate_username, validate_name_50char

# Configure application
app = Flask(__name__)

# Allow requests from front-end
CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
# configure the SQLite database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///finance.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
Session(app)

# Defining consts
ACCESS_DENIED = {"message": "Access Denied"} 

db = SQLAlchemy(app)

class Users(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(50))
   username = db.Column(db.String(50), unique=True)
   hash = db.Column(db.String(170), unique=True)
   admin = db.Column(db.Boolean, default=False)
   date_joined = db.Column(db.Date)
   expenses = db.relationship('Expenses', backref='user')
   
class ExpenseCategory(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(50))
   expenses = db.relationship('Expenses', backref='category')

class Expenses(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
   name = db.Column(db.String(50))
   price = db.Column(db.Float)
   date = db.Column(db.Date)
   category_id = db.Column(db.Integer, db.ForeignKey('expense_category.id'))

with app.app_context():
   db.create_all()
   

@app.route("/login", methods=["POST"])
def login():
    """Log in User"""
    
    # If request comes from a post method login form will be sent
    if request.method == "POST":
      # Getting login info
      login_info = request.json

      username = login_info.get('username')
      password = login_info.get('password')

      if not username or not password:
            return jsonify({'message': 'Invalid username or password'}), 600
      
      # Query database for username
      user = Users.query.filter(Users.username == username).first()

      if user is None or not check_password_hash(user.hash, password):
            return jsonify({'message': 'Invalid username or password'}), 600

      # Create a payload for the token
      payload = {
         'user_id': user.id,
         'admin': user.admin,
         'exp': datetime.now() + timedelta(hours=24)  # Set expiration time
      }

      # Generate the token
      token = jwt.encode(payload, 'your_secret_key', algorithm='HS256')

      # Return the token
      return jsonify({'token': token}), 200
    

@app.route("/logout", methods=["POST"])
@token_required
def logout():
    """Log user out"""

    # Return success and a message
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route("/register", methods=["POST"])
def register():
   """Register User"""

   register_info = request.json

   name = register_info.get('name')
   username = register_info.get('username')
   password = register_info.get('password')
   confirmation = register_info.get('confirmation')
   username_exists =  db.session.query(Users.query.filter_by(username=username).exists()).scalar()

   if username_exists:
      return jsonify({"message": "Username already exists"}), 403

   elif not name or not check_name_field(name):
      return jsonify({"message": "Use only letters for your name"}), 403

   elif not username or not validate_username(username):
      return jsonify({"message": "Username must only letters and numbers and smaller than 20 characters"}), 403

   elif not password or not validate_password(password):
      return jsonify({"message": "Password must contain at least 8 characters, numbers and special characters"}), 402
   
   elif confirmation != password:
      return jsonify({"message": "Password don't match"}), 406

   else:
      user = Users(name=name, username=username, hash=generate_password_hash(password), date_joined=date.today())

      try:
         db.session.add(user)
         db.session.commit()
         return jsonify("Success"), 200
      except SQLAlchemyError as e:
        # Log the error or handle it as needed
        return jsonify({"message": f"Database error: {str(e)}"}), 400


@app.route("/add_category", methods=["POST"])
@token_required
def add_category():
   if not g.get('admin'):
      return jsonify(ACCESS_DENIED), 401

   data = request.get_json()

   if not data or 'category' not in data:
      return jsonify("Missing category data"), 400

   category_json = data['category'].strip().lower()

   if not validate_name_50char(category_json):
      return jsonify("Only alphabetical and less than 50 characters names is allowed"), 500

   existing_category = db.session.query(ExpenseCategory).filter_by(name=category_json).first()

   if existing_category:
      return jsonify("Category already exists"), 403

   category = ExpenseCategory(name=category_json)

   try:
      db.session.add(category)
      db.session.commit()
      return jsonify("Category added"), 200
   except Exception as e:
      db.session.rollback()
      return jsonify(f"Some error occurred: {str(e)}"), 500


@app.route("/add_expense", methods=["POST"])
@token_required
def add_expense():
   categories = ExpenseCategory.query.all()

   expense_data = request.json

   if expense_data['category'] not in [category.name for category in categories]:
      return jsonify("Category not available"), 404
   if not expense_data["name"] or not expense_data["category"]:
      return jsonify("Name or category fields can't be null"), 403
   
   if not validate_name_50char(expense_data["name"]):
      return jsonify({"message": "Expense name can't contain numbers or greater than 50 characters"}), 400

   price = float(expense_data["price"])
   if price <= 0:
      return jsonify("Price can't be 0 or lower"), 403
   
   expense_date = datetime.strptime(expense_data["date"], "%Y-%m-%d").date()

   if expense_date > date.today():
      return jsonify("Date can't be in the future"), 403

   category = ExpenseCategory.query.filter_by(name=expense_data["category"]).first()
   if not category:
      return jsonify({"message": "Categort can't be empty"}), 400

   token = request.headers.get('Authorization')
   user_data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])

   expense_data_db = Expenses(
      user_id=user_data['user_id'],
      name=expense_data["name"],
      price=price,
      date=expense_date,
      category_id=category.id
   )

   try:
      db.session.add(expense_data_db)
      db.session.commit()

      return jsonify("Success"), 200
   except ValueError:
      return jsonify("Some error ocurred"), 400


@app.route("/get_categories")
@token_required
def get_categories():
   categories = ExpenseCategory.query.all()  # Fetch categories from your database
   category_names = [category.name for category in categories]
   
   return jsonify({'categories': category_names})


# Chartview route
@app.route("/chartview", methods=["GET"])
@token_required
def chartview():
   token = request.headers.get('Authorization')
   user_data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])
   try:
      years_query = db.session.query(func.extract('year', Expenses.date)).filter(Expenses.user_id == user_data['user_id']).distinct()
      years = [result[0] for result in years_query]
      return jsonify(years)
   except SQLAlchemyError as e:
        # Log the error or handle it as needed
        print(f"Database error: {e}")
        return jsonify({"message": "Some error occurred"}), 400


@app.route("/fetch_expenses_data", methods=["POST"])
@token_required
def fetch_expenses_data():
   token = request.headers.get('Authorization')
   user_data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])

   try:
      user_id = user_data.get("user_id")
      if not user_id:
         raise ValueError("user_id not found in tonken")
      
      expense_data_query = db.session.query(Expenses).filter(Expenses.user_id == user_id).all()
      
      expenses = []

      for expense in expense_data_query:
         # Converter cada objeto de despesa em um dicionário
         expense_data = {
            "name": expense.name,
            "category": expense.category.name,
            "price": expense.price,
            "date": expense.date
         }
         expenses.append(expense_data)

      return jsonify(expenses), 200
   except ValueError as ve:
      logging.error(f"ValueError: {str(ve)}")
      return jsonify({"message": str(ve)}), 400
   except Exception as e:
      logging.error(f"An error occurred: {str(e)}")
      return jsonify({"message": "Some error occurred"}), 400

# Route used by chartview
@app.route("/fetch_data_chart", methods=["POST"])
@token_required
def fetch_data_chart():
   year = request.json.get("year")  # Access JSON data from the request body
   token = request.headers.get('Authorization')
   user_data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])

   try:
      user_id = user_data.get("user_id")
      if not user_id:
         raise ValueError("user_id not found in tonken")
   except ValueError as ve:
      logging.error(f"ValueError: {str(ve)}")
      return jsonify({"message": str(ve)}), 400


   data_query = (
      db.session.query(
         func.extract('year', Expenses.date).label('year'),
         func.extract('month', Expenses.date).label('month'),
         func.sum(Expenses.price).label('total_value')
      )
      .filter(
         func.extract('year', Expenses.date) == year,
         Expenses.user_id == user_id # Ensure user_id condition placement
      )
      .group_by('year', 'month')
      .order_by('year', 'month')
   )

   data_query_sum = data_query.all()

   data = []

   for result in data_query_sum:
      data_sum = {
         'year': result.year,
         'month': result.month,
         'total_value': f'{result.total_value:.2f}'
      }
      data.append(data_sum)

   if not data:
      return jsonify(f"{'No data available for the year: ', year}"), 404
   else:
      return jsonify(data)

# Admin protected route
@app.route("/get_users", methods=["GET"])
@token_required
def get_users():

   # Checking if user is admin
   if not g.get('admin'):
       return jsonify(ACCESS_DENIED), 401
   
   users_query = db.session.query(Users.name , Users.username, Users.date_joined).all()

   users = []
   for user in users_query:
      result = {
         "name": user.name,
         "username": user.username,
         "date_joined": user.date_joined
      }
      users.append(result)

   try:
      return jsonify(users), 200
   except ValueError as e:
      return jsonify({"message" : f"Some error occurred: {str(e)}"}), 400

@app.route("/delete_user", methods=["POST"])
@token_required
def delete_user():

   # Checking if user is admin
   if not g.get('admin'):
       return jsonify({'message': 'Access denied'}), 401

   username_to_delete = request.json.get("username_to_delete")

   username_to_delete_query = db.session.query(Users).filter(Users.username == username_to_delete).first()

   if username_to_delete_query:
      try:
         db.session.delete(username_to_delete_query)
         db.session.commit()
         return jsonify("User deleted succesfully")
      except ValueError:
         return jsonify("An error occured"), 400
   else:
      return jsonify("No user found"), 302
      
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
   