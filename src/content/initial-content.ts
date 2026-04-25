import type { JSONValue } from '../schema'
import type { Root } from './index'
import { ContentType } from './types'

export const initialContent: JSONValue<Root> = [
  {
    type: ContentType.Text,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Willkommen zur Mathe-Stunde in Klasse 9. Heute üben wir ',
            },
          ],
        },
      ],
    },
  },
  {
    type: ContentType.FillInTheBlank,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Ein Pullover kostet 40 Euro, mit ' },
            { type: 'text', text: '25 %', marks: [{ type: 'gap' }] },
            { type: 'text', text: ' Rabatt kostet er 30 Euro.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Ein Buch kostet 20 Euro, mit 10 % Rabatt kostet es ',
            },
          ],
        },
      ],
    },
  },
  {
    type: ContentType.MultipleChoice,
    question: {
      type: 'doc',
      content: [
        {
          type: 'inlineBlock',
          content: [{ type: 'text', text: 'Wie viel sind 15 % von 200?' }],
        },
      ],
    },
    options: [
      {
        isCorrect: false,
        text: {
          type: 'doc',
          content: [
            { type: 'inlineBlock', content: [{ type: 'text', text: '20' }] },
          ],
        },
      },
      {
        isCorrect: false,
        text: {
          type: 'doc',
          content: [
            { type: 'inlineBlock', content: [{ type: 'text', text: '30' }] },
          ],
        },
      },
      {
        isCorrect: false,
        text: {
          type: 'doc',
          content: [
            { type: 'inlineBlock', content: [{ type: 'text', text: '40' }] },
          ],
        },
      },
    ],
  },
]
