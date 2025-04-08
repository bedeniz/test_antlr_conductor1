// SimpleLangEvaluatorVisitor.ts

import { BasicEvaluator } from "conductor/dist/conductor/runner";
import { IRunnerPlugin } from "conductor/dist/conductor/runner/types";
import { CharStream, CommonTokenStream, AbstractParseTreeVisitor } from 'antlr4ng';
import { SimpleLangLexer } from './parser/src/SimpleLangLexer';
import {
  ProgContext,
  AddContext,
  ToFactorContext,
  MultiplyContext,
  ToAtomContext,
  IntContext,
  ParensContext,
  SimpleLangParser,
  SimpleLangVisitor
} from './parser/src/SimpleLangParser';

class SimpleLangEvaluatorVisitor
  extends AbstractParseTreeVisitor<number>
  implements SimpleLangVisitor<number> 
{
  // Visit the top-level program.
  visitProg(ctx: ProgContext): number {
    return this.visit(ctx.expr());
  }

  // Visit an addition expression: expr '+' factor.
  // Custom: left + right + 1
  visitAdd(ctx: AddContext): number {
    const left = this.visit(ctx.expr());
    const right = this.visit(ctx.factor());
    return left + right + 1;
  }
  
  // When the alternative is just factor.
  visitToFactor(ctx: ToFactorContext): number {
    return this.visit(ctx.factor());
  }

  // Visit a multiplication expression: factor '*' atom.
  // Custom: left * right − 1
  visitMultiply(ctx: MultiplyContext): number {
    const left = this.visit(ctx.factor());
    const right = this.visit(ctx.atom());
    return left * right - 1;
  }
  
  // When the alternative is just atom.
  visitToAtom(ctx: ToAtomContext): number {
    return this.visit(ctx.atom());
  }

  // Visit an integer.
  visitInt(ctx: IntContext): number {
    return parseInt(ctx.INT().getText(), 10);
  }
  
  // Visit a parenthesized expression.
  visitParens(ctx: ParensContext): number {
    return this.visit(ctx.expr());
  }

  // Default result from any visit is 0.
  protected defaultResult(): number {
    return 0;
  }
  
  // Combine results from children – we simply use the next result.
  protected aggregateResult(aggregate: number, nextResult: number): number {
    return nextResult;
  }
}

export class SimpleLangEvaluator extends BasicEvaluator {
  private executionCount: number;
  private visitor: SimpleLangEvaluatorVisitor;

  constructor(conductor: IRunnerPlugin) {
    super(conductor);
    this.executionCount = 0;
    this.visitor = new SimpleLangEvaluatorVisitor();
  }

  async evaluateChunk(chunk: string): Promise<void> {
    this.executionCount++;
    try {
      // Create the lexer and parser.
      const inputStream = CharStream.fromString(chunk);
      const lexer = new SimpleLangLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new SimpleLangParser(tokenStream);
      
      // Parse the input.
      const tree = parser.prog();
      
      // Evaluate the parse tree.
      const result = this.visitor.visit(tree);
      
      // Send the result to the REPL.
      this.conductor.sendOutput(`Result of expression: ${result}`);
    } catch (error) {
      if (error instanceof Error) {
        this.conductor.sendOutput(`Error: ${error.message}`);
      } else {
        this.conductor.sendOutput(`Error: ${String(error)}`);
      }
    }
  }
}
