grammar SimpleLang;

// A program is an expression followed by EOF.
prog: expr EOF;

// An expression supports addition.
expr
    : expr '+' factor   # Add
    | factor            # ToFactor
    ;

// A factor supports multiplication.
factor
    : factor '*' atom   # Multiply
    | atom              # ToAtom
    ;

// An atom is either an integer or a parenthesized expression.
atom
    : INT               # Int
    | '(' expr ')'      # Parens
    ;

// Lexer rules.
INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;
