// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// /////////////////////////////////////////////////////////////////////////////
// Operations for intents
// /////////////////////////////////////////////////////////////////////////////

async function listIntents(projectId) {
  // [START dialogflow_list_intents]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(projectId);

  const request = {
    parent: projectAgentPath,
  };

  console.log(projectAgentPath);

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log('Input contexts:');
    intent.inputContextNames.forEach(inputContextName => {
      console.log(`\tName: ${inputContextName}`);
    });

    console.log('Output contexts:');
    intent.outputContexts.forEach(outputContext => {
      console.log(`\tName: ${outputContext.name}`);
    });
  });
  // [END dialogflow_list_intents]
}

async function createIntent(
  projectId,
  displayName,
  trainingPhrasesParts,
  messageTexts
) {
  // [START dialogflow_create_intent]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates the Intent Client
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

  const trainingPhrases = [];

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
  };

  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  const responses = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${responses[0].name} created`);
  // [END dialogflow_create_intent]
}

async function deleteIntent(projectId, intentId) {
  // [START dialogflow_delete_intent]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  return result;
  // [END dialogflow_delete_intent]
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for session entity type
// /////////////////////////////////////////////////////////////////////////////

async function createSessionEntityType(
  projectId,
  sessionId,
  entityValues,
  entityTypeDisplayName,
  entityOverrideMode
) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  const sessionPath = sessionEntityTypesClient.sessionPath(
    projectId,
    sessionId
  );
  const sessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    entityTypeDisplayName
  );

  // Here we use the entity value as the only synonym.
  const entities = [];
  entityValues.forEach(entityValue => {
    entities.push({
      value: entityValue,
      synonyms: [entityValue],
    });
  });

  const sessionEntityTypeRequest = {
    parent: sessionPath,
    sessionEntityType: {
      name: sessionEntityTypePath,
      entityOverrideMode: entityOverrideMode,
      entities: entities,
    },
  };

  const [response] = await sessionEntityTypesClient.createSessionEntityType(
    sessionEntityTypeRequest
  );
  console.log('SessionEntityType created:');
  console.log(response);
}

async function listSessionEntityTypes(projectId, sessionId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();
  const sessionPath = sessionEntityTypesClient.sessionPath(
    projectId,
    sessionId
  );

  const request = {
    parent: sessionPath,
  };

  // Send the request for retrieving the sessionEntityType.
  const [response] = await sessionEntityTypesClient.listSessionEntityTypes(
    request
  );
  response.forEach(sessionEntityType => {
    console.log(`Session entity type name: ${sessionEntityType.name}`);
    console.log(`Number of entities: ${sessionEntityType.entities.length}\n`);
  });
}

async function deleteSessionEntityType(
  projectId,
  sessionId,
  entityTypeDisplayName
) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  // The path to identify the sessionEntityType to be deleted.
  const sessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    entityTypeDisplayName
  );

  const request = {
    name: sessionEntityTypePath,
  };

  // Send the request for retrieving the sessionEntityType.
  const result = await sessionEntityTypesClient.deleteSessionEntityType(
    request
  );
  console.log(`Session entity type ${entityTypeDisplayName} deleted`);
  return result;
}

// /////////////////////////////////////////////////////////////////////////////
// Command line interface.
// /////////////////////////////////////////////////////////////////////////////
const cli = require(`yargs`)
  .demand(1)
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
  })
  .demandOption(
    'projectId',
    "Please provide your Dialogflow agent's project ID with the -p flag or through the GOOGLE_CLOUD_PROJECT env var"
  )
  .boolean('force')
  .alias('force', ['f'])
  .describe('force', 'force operation without a prompt')
  .command(
    'create-entity-type',
    'Create entity type',
    {
      displayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      kind: {
        alias: 'k',
        demandOption: true,
        requiresArg: true,
        description: 'The kind of entity. KIND_MAP or KIND_LIST.',
      },
    },
    opts => createEntityType(opts.projectId, opts.displayName, opts.kind)
  )
  .command('list-entity-types', 'List entity types', {}, opts =>
    listEntityTypes(opts.projectId)
  )
  .command(
    'delete-entity-type',
    'Delete entity type',
    {
      entityTypeId: {
        alias: 'e',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Session Id',
      },
    },
    opts => deleteEntityType(opts.projectId, opts.entityTypeId)
  )
  .command(
    'create-entity',
    'Create Entity',
    {
      entityTypeId: {
        alias: 'e',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Entity Type Id',
      },
      entityValue: {
        alias: 'v',
        demandOption: true,
        requiresArg: true,
        description: 'Entity Value',
      },
      synonyms: {
        alias: 's',
        array: true,
        demandOption: true,
        requiresArg: true,
        description: 'Synonyms',
      },
    },
    opts =>
      createEntity(
        opts.projectId,
        opts.entityTypeId,
        opts.entityValue,
        opts.synonyms
      )
  )
  .command(
    'list-entities',
    'List entities',
    {
      entityTypeId: {
        alias: 'e',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Entity Type Id',
      },
    },
    opts => listEntities(opts.projectId, opts.entityTypeId)
  )
  .command(
    'delete-entity',
    'Delete entity',
    {
      entityTypeId: {
        alias: 'e',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Entity Type Id',
      },
      entityValue: {
        alias: 'v',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Entity Value',
      },
    },
    opts => deleteEntity(opts.projectId, opts.entityTypeId, opts.entityValue)
  )
  .command(
    'create-context',
    'Create Context',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Session Id',
      },
      contextId: {
        alias: 'c',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Context Id',
      },
      lifespanCount: {
        alias: 'l',
        demandOption: true,
        requiresArg: true,
        description: 'Lifespan Count',
      },
    },
    opts =>
      createContext(
        opts.projectId,
        opts.sessionId,
        opts.contextId,
        opts.lifespanCount
      )
  )
  .command(
    'list-contexts',
    'List Intents',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Session Id',
      },
    },
    opts => listContexts(opts.projectId, opts.sessionId)
  )
  .command(
    'delete-context',
    'Delete Context',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Session Id',
      },
      contextId: {
        alias: 'c',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Context Id',
      },
    },
    opts => deleteContext(opts.projectId, opts.sessionId, opts.contextId)
  )
  .command(
    'create-intent',
    'Create Intent',
    {
      displayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      trainingPhrasesParts: {
        alias: 't',
        array: true,
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Training Phrases',
      },
      messageTexts: {
        alias: 'm',
        array: true,
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Message Texts',
      },
    },
    opts =>
      createIntent(
        opts.projectId,
        opts.displayName,
        opts.trainingPhrasesParts,
        opts.messageTexts
      )
  )
  .command('list-intents', 'List Intent', {}, opts =>
    listIntents(opts.projectId)
  )
  .command(
    'delete-intent',
    'Delete Intent',
    {
      intentId: {
        alias: 'i',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Intent Id',
      },
    },
    opts => deleteIntent(opts.projectId, opts.intentId)
  )
  .command(
    'create-session-entity-type',
    'Create entity type',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityValues: {
        alias: 'e',
        array: true,
        demandOption: true,
        requiresArg: true,
        description: 'The kind of entity. KIND_MAP or KIND_LIST.',
      },
      entityTypeDisplayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityOverrideMode: {
        alias: 'o',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts =>
      createSessionEntityType(
        opts.projectId,
        opts.sessionId,
        opts.entityValues,
        opts.entityTypeDisplayName,
        opts.entityOverrideMode
      )
  )
  .command(
    'list-session-entity-types',
    'List entity types',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts => listSessionEntityTypes(opts.projectId, opts.sessionId)
  )
  .command(
    'delete-session-entity-type',
    'Delete entity type',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityTypeDisplayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts =>
      deleteSessionEntityType(
        opts.projectId,
        opts.sessionId,
        opts.entityTypeDisplayName
      )
  )
  .example(`node $0 setup-agent`)
  .example(`node $0 show-agent`)
  .example(`node $0 clear-agent`)
  .example(`node $0 update-entity-type "my-entity-type-id"`)
  .example(`node $0 update-intent "my-intent-id"`)
  .example(`node $0 setup-session "my-session-id"`)
  .example(`node $0 show-session "my-session-id"`)
  .example(`node $0 clear-session "my-session-id"`)
  .example(`node $0 update-context "my-session-id" "my-context-id"`)
  .example(
    `node $0 update-session-entity-type "my-session-id" ` +
      `"my-entity-type-name"`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/dialogflow-enterprise/docs`
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
