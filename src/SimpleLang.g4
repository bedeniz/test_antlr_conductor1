grammar SimpleLang;

prog: expr EOF;

expr: primary (op primary)*;   // All binary operators are at the same level

primary
    : INT                   # Int
    | '(' expr ')'          # Parens
    ;

op: '+' | '*';

INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;
