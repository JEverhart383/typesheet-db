import HTTPController from '../controllers/HTTPController'

test('Missing "table" param GET request', () => {
  const httpController = new HTTPController('GET', {"queryString": "?id=thisotherid", "parameters" : {"id": "thisotherid" }})
  const errors = httpController.validateRequest()
  expect(errors.length).toBe(1)
  expect(errors[0]).toBe('Each GET request must specify a table parameter at minimum')
});