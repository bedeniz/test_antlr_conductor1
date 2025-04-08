import { BasicEvaluator } from "conductor/dist/conductor/runner";
import { IRunnerPlugin } from "conductor/dist/conductor/runner/types";
import { CharStream, CommonTokenStream, AbstractParseTreeVisitor } from 'antlr4ng';
import { SimpleLangLexer } from './parser/src/SimpleLangLexer';
import { ExpressionContext, ProgContext, SimpleLangParser } from './parser/src/SimpleLangParser';
import { SimpleLangVisitor } from './parser/src/SimpleLangVisitor';

class SimpleLangEvaluatorVisitor extends AbstractParseTreeVisitor<number> implements SimpleLangVisitor<number> {
    // Visit a parse tree produced by SimpleLangParser#prog
    visitProg(ctx: ProgContext): number {
        return this.visit(ctx.expression());
    }

    // Visit a parse tree produced by SimpleLangParser#expression
    visitExpression(ctx: ExpressionContext): number {
        if (ctx.getChildCount() === 1) {
            // INT case
            return parseInt(ctx.getText());
        } else if (ctx.getChildCount() === 3) {
            if (ctx.getChild(0).getText() === '(' && ctx.getChild(2).getText() === ')') {
                // Parenthesized expression
                return this.visit(ctx.getChild(1) as ExpressionContext);
            } else {
                // Binary operation
                const left = this.visit(ctx.getChild(0) as ExpressionContext);
                const op = ctx.getChild(1).getText();
                const right = this.visit(ctx.getChild(2) as ExpressionContext);

                switch (op) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Unknown operator: ${op}`);
                }
            }
        }
        
        throw new Error(`Invalid expression: ${ctx.getText()}`);
    }

    // Override the default result method from AbstractParseTreeVisitor
    protected defaultResult(): number {
        return 0;
    }
    
    // Override the aggregate result method
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
            // Create the lexer and parser
            const inputStream = CharStream.fromString(chunk);
            const lexer = new SimpleLangLexer(inputStream);
            const tokenStream = new CommonTokenStream(lexer);
            const parser = new SimpleLangParser(tokenStream);
            
            // Parse the input
            const tree = parser.prog();
            
            // Evaluate the parsed tree
            const result = this.visitor.visit(tree);
            
            // Send the result to the REPL
            this.conductor.sendOutput(`Result of expression: ${result}`);
        }  catch (error) {
            // Handle errors and send them to the REPL
            if (error instanceof Error) {
                this.conductor.sendOutput(`Error: ${error.message}`);
            } else {
                this.conductor.sendOutput(`Error: ${String(error)}`);
            }
        }
    }
}