from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Users(db.Model):
   __tablename__ = 'users'

   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(50))
   username = db.Column(db.String(50), unique=True)
   hash = db.Column(db.String(170), unique=True)
   admin = db.Column(db.Boolean, default=False)
   date_joined = db.Column(db.Date)
   expenses = db.relationship('Expenses', backref='user')
   
class ExpenseCategory(db.Model):
   __tablename__ = 'expense_category'

   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(50))
   expenses = db.relationship('Expenses', backref='category')

class Expenses(db.Model):
   __tablename__ = 'expenses'

   id = db.Column(db.Integer, primary_key=True)
   user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
   name = db.Column(db.String(50))
   price = db.Column(db.Float)
   date = db.Column(db.Date)
   category_id = db.Column(db.Integer, db.ForeignKey('expense_category.id'))