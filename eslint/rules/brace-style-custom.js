/**
 * @fileoverview Rule to flag block statements that do not use the one true brace style
 * @author Ian Christian Myers
 * @deprecated in ESLint v8.53.0
 */

"use strict";

const astUtils = {
  isTokenOnSameLine(left, right) {
    return left.loc.end.line === right.loc.start.line;
  },
  
}
const STATEMENT_LIST_PARENTS = new Set(["Program", "BlockStatement", "StaticBlock", "SwitchCase"]);

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce consistent brace style for blocks",
      recommended: false,
      url: "https://eslint.org/docs/latest/rules/brace-style"
    },
    schema: [
      {
        enum: ["1tbs", "stroustrup", "allman"]
      },
      {
        type: "object",
        properties: {
          allowSingleLine: {
            type: "boolean",
            default: false
          },
          //additional properties from original
          stroustrupAfterSingleLine: {
            type: "boolean",
            default: false
          },
          allowDualSingleLine: {
          	type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    fixable: "whitespace",
    messages: {
      nextLineOpen: "Opening curly brace does not appear on the same line as controlling statement.",
      sameLineOpen: "Opening curly brace appears on the same line as controlling statement.",
      blockSameLine: "Statement inside of curly braces should be on next line.",
      nextLineClose: "Closing curly brace does not appear on the same line as the subsequent block.",
      singleLineClose: "Closing curly brace should be on the same line as opening curly brace or on the line after the previous block.",
      sameLineClose: "Closing curly brace appears on the same line as the subsequent block."
    }
  },
  create(context) {
    const style = context.options[0] || "1tbs";
    const params = context.options[1] || {};
    const sourceCode = context.getSourceCode();


    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Fixes a place where a newline unexpectedly appears
     * @param {Token} firstToken The token before the unexpected newline
     * @param {Token} secondToken The token after the unexpected newline
     * @returns {Function} A fixer function to remove the newlines between the tokens
     */
    function removeNewlineBetween(firstToken, secondToken) {
      const textRange = [firstToken.range[1], secondToken.range[0]];
      const textBetween = sourceCode.text.slice(textRange[0], textRange[1]);

      // Don't do a fix if there is a comment between the tokens
      if (textBetween.trim()) {
        return null;
      }
      return fixer => fixer.replaceTextRange(textRange, " ");
    }

    /**
     * Validates a pair of curly brackets based on the user's config
     * @param {Token} openingCurly The opening curly bracket
     * @param {Token} closingCurly The closing curly bracket
     * @returns {void}
     */
    function validateCurlyPair(openingCurly, closingCurly) {
      const tokenBeforeOpeningCurly = sourceCode.getTokenBefore(openingCurly);
      const tokenAfterOpeningCurly = sourceCode.getTokenAfter(openingCurly);
      const tokenBeforeClosingCurly = sourceCode.getTokenBefore(closingCurly);
      params.allowSingleLine = true
      const singleLineException = params.allowSingleLine && astUtils.isTokenOnSameLine(openingCurly, closingCurly);

      // starting { should be after statement ex: 'else {'
      if (style !== "allman" && !astUtils.isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurly)) {
        if (params.stroustrupAfterSingleLine) {
          if (astUtils.isTokenOnSameLine(openingCurly, tokenAfterOpeningCurly) && tokenAfterOpeningCurly !== closingCurly) {
            context.report({
              node: openingCurly,
              message: 'kjsbjd',
              
            });
          }
        }
        context.report({
          node: openingCurly,
          messageId: "nextLineOpen",
          fix: removeNewlineBetween(tokenBeforeOpeningCurly, openingCurly)
        });
      }
      
      // starting { should be on the next line after statement ex: 'if (...)\n  { '
      if (style === "allman" && astUtils.isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurly) && !singleLineException) {
        context.report({
          node: openingCurly,
          messageId: "sameLineOpen",
          fix: fixer => fixer.insertTextBefore(openingCurly, "\n")
        });
      }

      if (astUtils.isTokenOnSameLine(openingCurly, tokenAfterOpeningCurly) && tokenAfterOpeningCurly !== closingCurly && !singleLineException) {
        context.report({
          node: openingCurly,
          messageId: "blockSameLine",
          fix: fixer => fixer.insertTextAfter(openingCurly, "\n")
        });
      }
            
      if (tokenBeforeClosingCurly !== openingCurly && !singleLineException && astUtils.isTokenOnSameLine(tokenBeforeClosingCurly, closingCurly)) {
        context.report({
          node: closingCurly,
          messageId: "singleLineClose",
          fix: fixer => fixer.insertTextBefore(closingCurly, "\n")
        });
      }
    }

    /**
     * Validates the location of a token that appears before a keyword (e.g. a newline before `else`)
     * @param {Token} curlyToken The closing curly token. This is assumed to precede a keyword token (such as `else` or `finally`).
     * @returns {void}
     */
    function validateCurlyBeforeKeyword(curlyToken, styleOverride) {
      const keywordToken = sourceCode.getTokenAfter(curlyToken);
      const newStyle = styleOverride || style

      if (newStyle === "1tbs" && !astUtils.isTokenOnSameLine(curlyToken, keywordToken)) {
        context.report({
          node: curlyToken,
          messageId: "nextLineClose",
          fix: removeNewlineBetween(curlyToken, keywordToken)
        });
      }

      if (newStyle !== "1tbs" && astUtils.isTokenOnSameLine(curlyToken, keywordToken) && !params.allowDualSingleLine) {
        context.report({
          node: curlyToken,
          messageId: "sameLineClose",
          fix: fixer => fixer.insertTextAfter(curlyToken, "\n")
        });
      }
    }
	
    
    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    return {
      BlockStatement(node) {
        if (!STATEMENT_LIST_PARENTS.has(node.parent.type)) {
          validateCurlyPair(sourceCode.getFirstToken(node), sourceCode.getLastToken(node));
        }
      },
      StaticBlock(node) {
        validateCurlyPair(
          sourceCode.getFirstToken(node, { skip: 1 }), // skip the `static` token
          sourceCode.getLastToken(node)
        );
      },
      ClassBody(node) {
        validateCurlyPair(sourceCode.getFirstToken(node), sourceCode.getLastToken(node));
      },
      SwitchStatement(node) {
        const closingCurly = sourceCode.getLastToken(node);
        const openingCurly = sourceCode.getTokenBefore(node.cases.length ? node.cases[0] : closingCurly);

        validateCurlyPair(openingCurly, closingCurly);
      },
      IfStatement(node) {
        if (node.consequent.type === "BlockStatement" && node.alternate) {
          if ( astUtils.isTokenOnSameLine(sourceCode.getFirstToken(node.consequent), sourceCode.getLastToken(node.consequent)) && params.stroustrupAfterSingleLine ) {
             validateCurlyBeforeKeyword(sourceCode.getLastToken(node.consequent), "stroustrup");
          } else {
          	// Handle the keyword after the `if` block (before `else`)
          	validateCurlyBeforeKeyword(sourceCode.getLastToken(node.consequent));
          }
        } //else if (node.consequent.type === "ExpressionStatement") {
          
        //}
      },
      TryStatement(node) {

        // Handle the keyword after the `try` block (before `catch` or `finally`)
        if ( astUtils.isTokenOnSameLine(sourceCode.getFirstToken(node.block), sourceCode.getLastToken(node.block)) && params.stroustrupAfterSingleLine ) {
          validateCurlyBeforeKeyword(sourceCode.getLastToken(node.block), "stroustrup");
        } else {
          // Handle the keyword after the `if` block (before `else`)
          validateCurlyBeforeKeyword(sourceCode.getLastToken(node.block));
        }
        //validateCurlyBeforeKeyword(sourceCode.getLastToken(node.block));

        if (node.handler && node.finalizer) {

          // Handle the keyword after the `catch` block (before `finally`)
          validateCurlyBeforeKeyword(sourceCode.getLastToken(node.handler.body));
        }
      }
    };
  }
};