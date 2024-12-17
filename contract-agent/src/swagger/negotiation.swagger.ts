// #swagger.start
/*
#swagger.tags = ['Negotiation']
#swagger.path = '/negotiation/contract/acceptance'
#swagger.method = 'post'
#swagger.description = 'Endpoint to check if a contract can be accepted.'
#swagger.parameters['profileId'] = {
    in: 'body',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['contractData'] = {
    in: 'body',
    description: 'Contract data.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Contract accepted.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Negotiation']
#swagger.path = '/negotiation/policy/acceptance'
#swagger.method = 'post'
#swagger.description = 'Endpoint to check if a policy can be accepted.'
#swagger.parameters['profileId'] = {
    in: 'body',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['policyData'] = {
    in: 'body',
    description: 'Policy data.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Policy accepted.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Negotiation']
#swagger.path = '/negotiation/service/acceptance'
#swagger.method = 'post'
#swagger.description = 'Endpoint to check if a service can be accepted.'
#swagger.parameters['profileId'] = {
    in: 'body',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['serviceData'] = {
    in: 'body',
    description: 'Service data.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Service accepted.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Negotiation']
#swagger.path = '/negotiation/contract/negotiatiate'
#swagger.method = 'post'
#swagger.description = 'Endpoint to negotiate a contract.'
#swagger.parameters['profileId'] = {
    in: 'body',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['contractData'] = {
    in: 'body',
    description: 'Contract data.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Contract negotiated.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Negotiation']
#swagger.path = '/negotiation/profile/preferences'
#swagger.method = 'put'
#swagger.description = 'Endpoint to update profile preferences.'
#swagger.parameters['profileId'] = {
    in: 'body',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preferences'] = {
    in: 'body',
    description: 'Preferences.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Preferences updated.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end
*/