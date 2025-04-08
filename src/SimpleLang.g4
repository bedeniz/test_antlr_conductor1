grammar SimpleLang;

prog: expr EOF;

expr: expr '+' factor      # Add
    | factor               # ToFactor
    ;

factor: factor '*' atom    # Multiply
      | atom               # ToAtom
      ;

atom: INT                  # Int
    | '(' expr ')'         # Parens
    ;

INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;
