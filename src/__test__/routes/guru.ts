export const loginTests = [
    {
        testName: 'Success',
        body: {
            email: 'deanprayoga09@gmail.com',
            password: '12345678'
        },
        statusCode: 200
    },
    {
        testName: 'Wrong Password',
        body: {
            email: 'deanprayoga09@gmail.com',
            password: '13255'
        },
        statusCode: 401
    },
    {
        testName: 'No Email and Password Provided',
        body: {},
        statusCode: 400
    },
    {
        testName: 'No Email Provided',
        body: {
            password: '12345678'
        },
        statusCode: 400
    },
    {
        testName: 'No Password Provided',
        body: {
            email: 'deanprayoga09@gmail.com'
        },
        statusCode: 400
    }
]