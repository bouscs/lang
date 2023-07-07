# lang

parse nodes:

- Statement

  - There can only be one statement per line in the containing scope.

  - Statements can return a value

- Expression

  - Expressions evaluate to a value

  - Expressions can be used as statements

- Scope

  - A scope is a series of statements, optionally returning a value

  - Inside a scope it has its own `self` context

- Comment

  - Single-line or multi-line

character types:

- word

  - a-zA-Z

  - 0-9 (not at the beginning of a token)

- Block bounds

  - () {} [] <> ' "

- Operators

  - - - - / % ^ & | ~ ! = < > ? : ; , . @ # $ \_ \ `

- Whitespace

  - \s \t

- Newline

  - \n

- Escape

  - \\

Precedence:

- Parenthesis

- Statements

- List

- Access (.) - Changes scope to the symbol's value (eg. "my_var." sets the scope to my_var where you can access its inner symbols)

- Assignment

- Function Call

- Function Definition

- Arithmetic

- Comparison
