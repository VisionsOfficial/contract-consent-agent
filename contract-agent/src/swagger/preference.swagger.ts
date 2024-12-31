// #swagger.start
/*
#swagger.tags = ['Preference']
#swagger.path = '/{profileId}/preferences'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get preferences from profile.'
#swagger.parameters['profileId'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Preferences data.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Preference']
#swagger.path = '/{profileId}/preferences/{preferenceId}'
#swagger.method = 'get'
#swagger.description = 'Endpoint to get preference by id from profile.'
#swagger.parameters['profileId'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preferenceId'] = {
    in: 'path',
    description: 'Preference id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Preference data.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Preference']
#swagger.path = '/{profileId}/preferences'
#swagger.method = 'post'
#swagger.description = 'Endpoint to add preference to profile.'
#swagger.parameters['profileId'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preference'] = {
    in: 'body',
    description: 'Preference data.',
    required: true,
    schema: {
        type: 'string'
    }
}
#swagger.responses[200] = {
    description: 'Preference added.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Preference']
#swagger.path = '/{profileId}/preferences/{preferenceId}'
#swagger.method = 'put'
#swagger.description = 'Endpoint to update preference from a profile.'
#swagger.parameters['profileId'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preferenceId'] = {
    in: 'path',
    description: 'Preference id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preference'] = {
    in: 'body',
    description: 'Updated preference data.',
    required: true,
    schema: {
        type: 'string'
    }
}
#swagger.responses[200] = {
    description: 'Preference updated.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end

// #swagger.start
/*
#swagger.tags = ['Preference']
#swagger.path = '/{profileId}/preferences/{preferenceId}'
#swagger.method = 'delete'
#swagger.description = 'Endpoint to delete preference from a profile.'
#swagger.parameters['profileId'] = {
    in: 'path',
    description: 'Profile id.',
    required: true,
    type: 'string'
}
#swagger.parameters['preferenceId'] = {
    in: 'path',
    description: 'Preference id.',
    required: true,
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Preference deleted.'
}
#swagger.responses[500] = {
    description: 'Internal server error.'
}
//#swagger.end
*/