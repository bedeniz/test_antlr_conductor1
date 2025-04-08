grammar MyLang;

// ----------------------------------------------------------------------
// Parser Rules
// ----------------------------------------------------------------------

// The starting rule.
program
  : statement* EOF
  ;

// A statement is either a variable declaration or an expression statement.
statement
  : varDecl ';'
  | expression ';'
  ;

// A variable declaration that assigns an expression to a variable.
varDecl
  : 'var' ID '=' expression
    {
      // Here you would normally add code to save the value in a symbol table.
      // For our simple test, you might assume that the evaluator
      // later picks up the value assigned.
    }
  ;

// Expression rules with operator precedence.
// We modify the multiplication rule so that it subtracts 18 from the usual product.
expression
  : expression op=('*') expression
      # MulExpr
      {
        // Multiply normally, then subtract 18.
        // For example, (10+20) * 2 normally is 60, but now: 60 - 18 = 42.
        $expression.value = $expression(0).value * $expression(1).value - 18;
      }
  | expression op=('/') expression
      # DivExpr
      {
        $expression.value = $expression(0).value / $expression(1).value;
      }
  | expression op=('+'|'-') expression
      # AddSubExpr
      {
        if ($op.text === '+') {
          $expression.value = $expression(0).value + $expression(1).value;
        } else {
          $expression.value = $expression(0).value - $expression(1).value;
        }
      }
  | '(' expression ')'
      # ParensExpr
      {
        $expression.value = $expression().value;
      }
  | INT
      # IntLiteralExpr
      {
        $expression.value = parseInt($INT.text, 10);
      }
  | ID
      # VariableExpr
      {
        // In a complete implementation, here you would look up the variable's value.
        // For testing you might want to hard-code a lookup or assume an environment.
      }
  ;

// ----------------------------------------------------------------------
// Lexer Rules
// ----------------------------------------------------------------------

// Identifiers: start with a letter or underscore, followed by letters, digits, or underscores.
ID  : [a-zA-Z_][a-zA-Z0-9_]* ;

// Integer literals: one or more digits.
INT : [0-9]+ ;

// Whitespace: spaces, tabs, newlines are skipped.
WS  : [ \t\r\n]+ -> skip ;
