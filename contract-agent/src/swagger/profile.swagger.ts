// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/services-recommendations'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get services recommendations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Services recommendations.',
    schema: {
        $ref: '#/definitions/ServicesRecommendations'
    }
}
#swagger.responses[500] = {
    description: 'Internal server error.',
    schema: {
        $ref: '#/definitions/Error'
    }
 */
//#swagger.end
// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/policies-recommendations'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get policies recommendations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Policies recommendations.',
    schema: {
        $ref: '#/definitions/PoliciesRecommendations'
    }
}
#swagger.responses[500] = {
    description: 'Internal server error.',
    schema: {
        $ref: '#/definitions/Error'
    }
 */
//#swagger.end
// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/policies-matching'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get policies matching from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Matching recommendations.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/service-recommendations'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get service recommendations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Service recommendations.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/contract-matching'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get contract matching from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Contract matching.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/configurations'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get configurations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Configurations.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/configurations'
#swagger.method = 'post'
#swagger.description = 'Endpoint to add configurations to a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['configurations'] = {
    in: 'body',
    description: 'Configurations.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.parameters['profileURI'] = {
    in: 'body',
    description: 'Profile URI.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Configurations added.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/configurations'
#swagger.method = 'put'
#swagger.description = 'Endpoint to update configurations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['configurations'] = {
    in: 'body',
    description: 'Configurations.',
    required: true,
    schema: {
        type: 'object',
        additionalProperties: true // Adjust this based on your actual schema
    }
}
#swagger.responses[200] = {
    description: 'Configurations updated.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Profile']
#swagger.path = '/profile/:id/configurations'
#swagger.method = 'delete'
#swagger.description = 'Endpoint to delete configurations from a profile.'
#swagger.parameters['id'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Configurations deleted.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end
*/