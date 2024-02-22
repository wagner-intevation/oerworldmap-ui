import Ajv from 'ajv'

const validate = (schema) => {
  const ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
  })
  ajv.addMetaSchema(require('ajv-draft-04/dist/refs/json-schema-draft-04.json'))
  return ajv.compile(schema)
}

export default validate
