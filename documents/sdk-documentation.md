Chatbot

The useChat hook makes it effortless to create a conversational user interface for your chatbot application. It enables the streaming of chat messages from your AI provider, manages the chat state, and updates the UI automatically as new messages arrive.

To summarize, the useChat hook provides the following features:

    Message Streaming: All the messages from the AI provider are streamed to the chat UI in real-time.
    Managed States: The hook manages the states for input, messages, status, error and more for you.
    Seamless Integration: Easily integrate your chat AI into any design or layout with minimal effort.

In this guide, you will learn how to use the useChat hook to create a chatbot application with real-time message streaming. Check out our chatbot with tools guide to learn how to use tools in your chatbot. Let's start with the following example first.
Example
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}

The UI messages have a new parts property that contains the message parts. We recommend rendering the messages using the parts property instead of the content property. The parts property supports different message types, including text, tool invocation, and tool result, and allows for more flexible and complex chat UIs.

In the Page component, the useChat hook will request to your AI provider endpoint whenever the user submits a message. The messages are then streamed back in real-time and displayed in the chat UI.

This enables a seamless chat experience where the user can see the AI response as soon as it is available, without having to wait for the entire response to be received.
Customized UI

useChat also provides ways to manage the chat message and input states via code, show status, and update messages without being triggered by user interactions.
Status

The useChat hook returns a status. It has the following possible values:

    submitted: The message has been sent to the API and we're awaiting the start of the response stream.
    streaming: The response is actively streaming in from the API, receiving chunks of data.
    ready: The full response has been received and processed; a new user message can be submitted.
    error: An error occurred during the API request, preventing successful completion.

You can use status for e.g. the following purposes:

    To show a loading spinner while the chatbot is processing the user's message.
    To show a "Stop" button to abort the current message.
    To disable the submit button.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <Spinner />}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

Error State

Similarly, the error state reflects the error object thrown during the fetch request. It can be used to display an error message, disable the submit button, or show a retry button:

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({});

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={error != null}
        />
      </form>
    </div>
  );
}

Please also see the error handling guide for more information.
Modify messages

Sometimes, you may want to directly modify some existing messages. For example, a delete button can be added to each message to allow users to remove them from the chat history.

The setMessages function can help you achieve these tasks:

const { messages, setMessages, ... } = useChat()

const handleDelete = (id) => {
  setMessages(messages.filter(message => message.id !== id))
}

return <>
  {messages.map(message => (
    <div key={message.id}>
      {message.role === 'user' ? 'User: ' : 'AI: '}
      {message.content}
      <button onClick={() => handleDelete(message.id)}>Delete</button>
    </div>
  ))}
  ...

You can think of messages and setMessages as a pair of state and setState in React.
Controlled input

In the initial example, we have handleSubmit and handleInputChange callbacks that manage the input changes and form submissions. These are handy for common use cases, but you can also use uncontrolled APIs for more advanced scenarios such as form validation or customized components.

The following example demonstrates how to use more granular APIs like setInput and append with your custom input and submit button components:

const { input, setInput, append } = useChat()

return <>
  <MyCustomInput value={input} onChange={value => setInput(value)} />
  <MySubmitButton onClick={() => {
    // Send a new message to the AI provider
    append({
      role: 'user',
      content: input,
    })
  }}/>
  ...

Cancellation and regeneration

It's also a common use case to abort the response message while it's still streaming back from the AI provider. You can do this by calling the stop function returned by the useChat hook.

const { stop, status, ... } = useChat()

return <>
  <button onClick={stop} disabled={!(status === 'streaming' || status === 'submitted')}>Stop</button>
  ...

When the user clicks the "Stop" button, the fetch request will be aborted. This avoids consuming unnecessary resources and improves the UX of your chatbot application.

Similarly, you can also request the AI provider to reprocess the last message by calling the reload function returned by the useChat hook:

const { reload, status, ... } = useChat()

return <>
  <button onClick={reload} disabled={!(status === 'ready' || status === 'error')}>Regenerate</button>
  ...
</>

When the user clicks the "Regenerate" button, the AI provider will regenerate the last message and replace the current one correspondingly.
Throttling UI Updates
This feature is currently only available for React.

By default, the useChat hook will trigger a render every time a new chunk is received. You can throttle the UI updates with the experimental_throttle option.
page.tsx

const { messages, ... } = useChat({
  // Throttle the messages and data updates to 50ms:
  experimental_throttle: 50
})

Event Callbacks

useChat provides optional event callbacks that you can use to handle different stages of the chatbot lifecycle:

    onFinish: Called when the assistant message is completed
    onError: Called when an error occurs during the fetch request.
    onResponse: Called when the response from the API is received.

These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.

import { Message } from '@ai-sdk/react';

const {
  /* ... */
} = useChat({
  onFinish: (message, { usage, finishReason }) => {
    console.log('Finished streaming message:', message);
    console.log('Token usage:', usage);
    console.log('Finish reason:', finishReason);
  },
  onError: error => {
    console.error('An error occurred:', error);
  },
  onResponse: response => {
    console.log('Received HTTP response from server:', response);
  },
});

It's worth noting that you can abort the processing by throwing an error in the onResponse callback. This will trigger the onError callback and stop the message from being appended to the chat UI. This can be useful for handling unexpected responses from the AI provider.
Request Configuration
Custom headers, body, and credentials

By default, the useChat hook sends a HTTP POST request to the /api/chat endpoint with the message list as the request body. You can customize the request by passing additional options to the useChat hook:

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/custom-chat',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});

In this example, the useChat hook sends a POST request to the /api/custom-chat endpoint with the specified headers, additional body fields, and credentials for that fetch request. On your server side, you can handle the request with these additional information.
Setting custom body fields per request

You can configure custom body fields on a per-request basis using the body option of the handleSubmit function. This is useful if you want to pass in additional information to your backend that is not part of the message list.
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            body: {
              customKey: 'customValue',
            },
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}

You can retrieve these custom fields on your server side by destructuring the request body:
app/api/chat/route.ts

export async function POST(req: Request) {
  // Extract addition information ("customKey") from the body of the request:
  const { messages, customKey } = await req.json();
  //...
}

Controlling the response stream

With streamText, you can control how error messages and usage information are sent back to the client.
Error Messages

By default, the error message is masked for security reasons. The default error message is "An error occurred." You can forward error messages or send your own error message by providing a getErrorMessage function:
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: error => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}

Usage Information

By default, the usage information is sent back to the client. You can disable it by setting the sendUsage option to false:
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    sendUsage: false,
  });
}

Text Streams

useChat can handle plain text streams by setting the streamProtocol option to text:
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages } = useChat({
    streamProtocol: 'text',
  });

  return <>...</>;
}

This configuration also works with other backend servers that stream plain text. Check out the stream protocol guide for more information.

When using streamProtocol: 'text', tool calls, usage information and finish reasons are not available.
Empty Submissions

You can configure the useChat hook to allow empty submissions by setting the allowEmptySubmit option to true.
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            allowEmptySubmit: true,
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}

Reasoning

Some models such as as DeepSeek deepseek-reasoner and Anthropic claude-3-7-sonnet-20250219 support reasoning tokens. These tokens are typically sent before the message content. You can forward them to the client with the sendReasoning option:
app/api/chat/route.ts

import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-reasoner'),
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}

On the client side, you can access the reasoning parts of the message object.

They have a details property that contains the reasoning and redacted reasoning parts. You can also use reasoning to access just the reasoning as a string.
app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      // text parts:
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      }

      // reasoning parts:
      if (part.type === 'reasoning') {
        return (
          <pre key={index}>
            {part.details.map(detail =>
              detail.type === 'text' ? detail.text : '<redacted>',
            )}
          </pre>
        );
      }
    })}
  </div>
));

Sources

Some providers such as Perplexity and Google Generative AI include sources in the response.

Currently sources are limited to web pages that ground the response. You can forward them to the client with the sendSources option:
app/api/chat/route.ts

import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: perplexity('sonar-pro'),
    messages,
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}

On the client side, you can access source parts of the message object. Here is an example that renders the sources as links at the bottom of the message:
app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts
      .filter(part => part.type !== 'source')
      .map((part, index) => {
        if (part.type === 'text') {
          return <div key={index}>{part.text}</div>;
        }
      })}
    {message.parts
      .filter(part => part.type === 'source')
      .map(part => (
        <span key={`source-${part.source.id}`}>
          [
          <a href={part.source.url} target="_blank">
            {part.source.title ?? new URL(part.source.url).hostname}
          </a>
          ]
        </span>
      ))}
  </div>
));

Image Generation

Some models such as Google gemini-2.0-flash-exp support image generation. When images are generated, they are exposed as files to the client. On the client side, you can access file parts of the message object and render them as images.
app/page.tsx

messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      } else if (part.type === 'file' && part.mimeType.startsWith('image/')) {
        return (
          <img key={index} src={`data:${part.mimeType};base64,${part.data}`} />
        );
      }
    })}
  </div>
));

Attachments (Experimental)

The useChat hook supports sending attachments along with a message as well as rendering them on the client. This can be useful for building applications that involve sending images, files, or other media content to the AI provider.

There are two ways to send attachments with a message, either by providing a FileList object or a list of URLs to the handleSubmit function:
FileList

By using FileList, you can send multiple files as attachments along with a message using the file input element. The useChat hook will automatically convert them into data URLs and send them to the AI provider.

Currently, only image/* and text/* content types get automatically converted into multi-modal content parts. You will need to handle other content types manually.
app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}

URLs

You can also send URLs as attachments along with a message. This can be useful for sending links to external resources or media content.

    Note: The URL can also be a data URL, which is a base64-encoded string that represents the content of a file. Currently, only image/* content types get automatically converted into multi-modal content parts. You will need to handle other content types manually.

app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Attachment } from '@ai-sdk/ui-utils';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [attachments] = useState<Attachment[]>([
    {
      name: 'earth.png',
      contentType: 'image/png',
      url: 'https://example.com/earth.png',
    },
    {
      name: 'moon.png',
      contentType: 'image/png',
      url: 'data:image/png;base64,iVBORw0KGgo...',
    },
  ]);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType?.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: attachments,
          });
        }}
      >
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}

Chatbot Tool Usage

With useChat and streamText, you can use tools in your chatbot application. The AI SDK supports three types of tools in this context:

    Automatically executed server-side tools
    Automatically executed client-side tools
    Tools that require user interaction, such as confirmation dialogs

The flow is as follows:

    The user enters a message in the chat UI.
    The message is sent to the API route.
    In your server side route, the language model generates tool calls during the streamText call.
    All tool calls are forwarded to the client.
    Server-side tools are executed using their execute method and their results are forwarded to the client.
    Client-side tools that should be automatically executed are handled with the onToolCall callback. You can return the tool result from the callback.
    Client-side tool that require user interactions can be displayed in the UI. The tool calls and results are available as tool invocation parts in the parts property of the last assistant message.
    When the user interaction is done, addToolResult can be used to add the tool result to the chat.
    When there are tool calls in the last assistant message and all tool results are available, the client sends the updated messages back to the server. This triggers another iteration of this flow.

The tool call and tool executions are integrated into the assistant message as tool invocation parts. A tool invocation is at first a tool call, and then it becomes a tool result when the tool is executed. The tool result contains all information about the tool call as well as the result of the tool execution.

In order to automatically send another request to the server when all tool calls are server-side, you need to set maxSteps to a value greater than 1 in the useChat options. It is disabled by default for backward compatibility.
Example

In this example, we'll use three tools:

    getWeatherInformation: An automatically executed server-side tool that returns the weather in a given city.
    askForConfirmation: A user-interaction client-side tool that asks the user for confirmation.
    getLocation: An automatically executed client-side tool that returns a random city.

API route
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        execute: async ({}: { city: string }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}

Client-side page

The client-side page uses the useChat hook to create a chatbot application with real-time message streaming. Tool invocations are displayed in the chat UI as tool invocation parts. Please make sure to render the messages using the parts property of the message.

There are three things worth mentioning:

    The onToolCall callback is used to handle client-side tools that should be automatically executed. In this example, the getLocation tool is a client-side tool that returns a random city.

    The toolInvocations property of the last assistant message contains all tool calls and results. The client-side tool askForConfirmation is displayed in the UI. It asks the user for confirmation and displays the result once the user confirms or denies the execution. The result is added to the chat using addToolResult.

    The maxSteps option is set to 5. This enables several tool use iterations between the client and the server.

app/page.tsx

'use client';

import { ToolInvocation } from 'ai';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getLocation') {
          const cities = [
            'New York',
            'Los Angeles',
            'Chicago',
            'San Francisco',
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <>
      {messages?.map(message => (
        <div key={message.id}>
          <strong>{`${message.role}: `}</strong>
          {message.parts.map(part => {
            switch (part.type) {
              // render text parts as simple text:
              case 'text':
                return part.text;

              // for tool invocations, distinguish between the tools and the state:
              case 'tool-invocation': {
                const callId = part.toolInvocation.toolCallId;

                switch (part.toolInvocation.toolName) {
                  case 'askForConfirmation': {
                    switch (part.toolInvocation.state) {
                      case 'call':
                        return (
                          <div key={callId}>
                            {part.toolInvocation.args.message}
                            <div>
                              <button
                                onClick={() =>
                                  addToolResult({
                                    toolCallId: callId,
                                    result: 'Yes, confirmed.',
                                  })
                                }
                              >
                                Yes
                              </button>
                              <button
                                onClick={() =>
                                  addToolResult({
                                    toolCallId: callId,
                                    result: 'No, denied',
                                  })
                                }
                              >
                                No
                              </button>
                            </div>
                          </div>
                        );
                      case 'result':
                        return (
                          <div key={callId}>
                            Location access allowed:{' '}
                            {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }

                  case 'getLocation': {
                    switch (part.toolInvocation.state) {
                      case 'call':
                        return <div key={callId}>Getting location...</div>;
                      case 'result':
                        return (
                          <div key={callId}>
                            Location: {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }

                  case 'getWeatherInformation': {
                    switch (part.toolInvocation.state) {
                      // example of pre-rendering streaming tool calls:
                      case 'partial-call':
                        return (
                          <pre key={callId}>
                            {JSON.stringify(part.toolInvocation, null, 2)}
                          </pre>
                        );
                      case 'call':
                        return (
                          <div key={callId}>
                            Getting weather information for{' '}
                            {part.toolInvocation.args.city}...
                          </div>
                        );
                      case 'result':
                        return (
                          <div key={callId}>
                            Weather in {part.toolInvocation.args.city}:{' '}
                            {part.toolInvocation.result}
                          </div>
                        );
                    }
                    break;
                  }
                }
              }
            }
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  );
}

Tool call streaming

You can stream tool calls while they are being generated by enabling the toolCallStreaming option in streamText.
app/api/chat/route.ts

export async function POST(req: Request) {
  // ...

  const result = streamText({
    toolCallStreaming: true,
    // ...
  });

  return result.toDataStreamResponse();
}

When the flag is enabled, partial tool calls will be streamed as part of the data stream. They are available through the useChat hook. The tool invocation parts of assistant messages will also contain partial tool calls. You can use the state property of the tool invocation to render the correct UI.
app/page.tsx

export default function Chat() {
  // ...
  return (
    <>
      {messages?.map(message => (
        <div key={message.id}>
          {message.parts.map(part => {
            if (part.type === 'tool-invocation') {
              switch (part.toolInvocation.state) {
                case 'partial-call':
                  return <>render partial tool call</>;
                case 'call':
                  return <>render full tool call</>;
                case 'result':
                  return <>render tool result</>;
              }
            }
          })}
        </div>
      ))}
    </>
  );
}

Step start parts

When you are using multi-step tool calls, the AI SDK will add step start parts to the assistant messages. If you want to display boundaries between tool invocations, you can use the step-start parts as follows:
app/page.tsx

// ...
// where you render the message parts:
message.parts.map((part, index) => {
  switch (part.type) {
    case 'step-start':
      // show step boundaries as horizontal lines:
      return index > 0 ? (
        <div key={index} className="text-gray-500">
          <hr className="my-2 border-gray-300" />
        </div>
      ) : null;
    case 'text':
    // ...
    case 'tool-invocation':
    // ...
  }
});
// ...

Server-side Multi-Step Calls

You can also use multi-step calls on the server-side with streamText. This works when all invoked tools have an execute function on the server side.
app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        // tool has execute function:
        execute: async ({}: { city: string }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      },
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}

Errors

Language models can make errors when calling tools. By default, these errors are masked for security reasons, and show up as "An error occurred" in the UI.

To surface the errors, you can use the getErrorMessage function when calling toDataStreamResponse.

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

const result = streamText({
  // ...
});

return result.toDataStreamResponse({
  getErrorMessage: errorHandler,
});

In case you are using createDataStreamResponse, you can use the onError function when calling toDataStreamResponse:

const response = createDataStreamResponse({
  // ...
  async execute(dataStream) {
    // ...
  },
  onError: error => `Custom error: ${error.message}`,
});


Object Generation
useObject is an experimental feature and only available in React.

The useObject hook allows you to create interfaces that represent a structured JSON object that is being streamed.

In this guide, you will learn how to use the useObject hook in your application to generate UIs for structured data on the fly.
Example

The example shows a small notifications demo app that generates fake notifications in real-time.
Schema

It is helpful to set up the schema in a separate file that is imported on both the client and server.
app/api/notifications/schema.ts

import { z } from 'zod';

// define a schema for the notifications
export const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
    }),
  ),
});

Client

The client uses useObject to stream the object generation process.

The results are partial and are displayed as they are received. Please note the code for handling undefined values in the JSX.
app/page.tsx

'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/notifications/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}

Server

On the server, we use streamObject to stream the object generation process.
app/api/notifications/route.ts

import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}

Customized UI

useObject also provides ways to show loading and error states:
Loading State

The isLoading state returned by the useObject hook can be used for several purposes:

    To show a loading spinner while the object is generated.
    To disable the submit button.

app/page.tsx

'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { isLoading, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {isLoading && <Spinner />}

      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}

Stop Handler

The stop function can be used to stop the object generation process. This can be useful if the user wants to cancel the request or if the server is taking too long to respond.
app/page.tsx

'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { isLoading, stop, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {isLoading && (
        <button type="button" onClick={() => stop()}>
          Stop
        </button>
      )}

      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}

Error State

Similarly, the error state reflects the error object thrown during the fetch request. It can be used to display an error message, or to disable the submit button:

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.

'use client';

import { useObject } from '@ai-sdk/react';

export default function Page() {
  const { error, object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      {error && <div>An error occurred.</div>}

      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}

Event Callbacks

useObject provides optional event callbacks that you can use to handle life-cycle events.

    onFinish: Called when the object generation is completed.
    onError: Called when an error occurs during the fetch request.

These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.
app/page.tsx

'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/notifications/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
    onFinish({ object, error }) {
      // typed object, undefined if schema validation fails:
      console.log('Object generation completed:', object);

      // error, undefined if schema validation succeeds:
      console.log('Schema validation error:', error);
    },
    onError(error) {
      // error during fetch request:
      console.error('An error occurred:', error);
    },
  });

  return (
    <div>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </div>
  );
}

Configure Request Options

You can configure the API endpoint, optional headers and credentials using the api, headers and credentials settings.

const { submit, object } = useObject({
  api: '/api/use-object',
  headers: {
    'X-Custom-Header': 'CustomValue',
  },
  credentials: 'include',
  schema: yourSchema,
});