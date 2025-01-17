// @flow

import createDebug from 'debug';
import isSqlQuery from '../utilities/isSqlQuery';

const debug = createDebug('eslint-plugin-sql:rule:no-unsafe-query');

export default (context) => {
  const placeholderRule = context.settings.sql && context.settings.sql.placeholderRule;

  const allowLiteral = context.options && context.options[0] && context.options[0].allowLiteral;

  return {
    TemplateLiteral (node) {
      if (allowLiteral && node.quasis.length === 1) {
        return;
      }

      const literal = node.quasis
        .map((quasi) => {
          return quasi.value.raw;
        })
        .join('foo');

      debug('input', literal);

      const recognizedAsQuery = isSqlQuery(literal, placeholderRule);

      debug('recognized as a query', recognizedAsQuery);

      if (!recognizedAsQuery) {
        return;
      }

      const {tag} = node.parent;
      const legacyTagName = tag && tag.name && tag.name.toLowerCase();
      const tagName = tag && tag.property && tag.property.name && tag.property.name.toLowerCase();

      if (legacyTagName !== 'sql' && tagName !== 'sql') {
        context.report({
          message: 'Use "sql" tag',
          node,
        });
      }
    },
  };
};
