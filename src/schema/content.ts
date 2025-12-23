import {
  createArray,
  createLiteral,
  createObject,
  createRichText,
  createTruthValue,
  createUnion,
  createWrapper,
} from './kinds'
import { RichTextFeature } from './rich-text'
import type { Schema } from './types'

enum ContentType {
  Text = 'text',
  FillInTheBlank = 'fill-in-the-blank',
  MultipleChoice = 'multiple-choice',
}

const TruthValue = createTruthValue({ name: 'TruthValue' })

const InlineRichText = createRichText({
  name: 'InlineRichText',
  features: [RichTextFeature.Bold, RichTextFeature.Italic],
})

const ContentRichText = createRichText({
  name: 'ContentRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Heading,
    RichTextFeature.List,
  ],
})

const FillInTheBlankRichText = createRichText({
  name: 'FillInTheBlankRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Blank,
  ],
})

const TextContent = createWrapper({
  name: 'TextContent',
  wrappedSchema: ContentRichText,
  wrap: (value) => ({ type: ContentType.Text, content: value }),
  unwrap: (value) => value.content,
})

const FillInTheBlankExercise = createWrapper({
  name: 'FillInTheBlankExercise',
  wrappedSchema: FillInTheBlankRichText,
  wrap: (value) => ({ type: ContentType.FillInTheBlank, content: value }),
  unwrap: (value) => value.content,
})

export const MultipleChoiceExercise = createObject({
  name: 'MultipleChoiceExercise',
  properties: {
    type: createLiteral({
      name: 'MultipleChoiceType',
      value: ContentType.MultipleChoice,
    }),
    question: InlineRichText,
    options: createArray({
      name: 'MultipleChoiceOptions',
      itemSchema: createObject({
        name: 'MultipleChoiceOption',
        properties: {
          isCorrect: TruthValue,
          text: InlineRichText,
        },
        keyOrder: ['isCorrect', 'text'],
      }),
    }),
  },
  keyOrder: ['question', 'options'],
})

const EducationalContent = createArray({
  name: 'EducationalContent',
  itemSchema: createUnion({
    name: 'EducationalContentItem',
    options: [TextContent, FillInTheBlankExercise, MultipleChoiceExercise],
    getOption: (value) => {
      switch (value.type) {
        case ContentType.Text:
          return TextContent
        case ContentType.FillInTheBlank:
          return FillInTheBlankExercise
        case ContentType.MultipleChoice:
          return MultipleChoiceExercise
      }
    },
  }),
})

export type Root = typeof Root
export const Root = createWrapper({
  name: 'Root',
  wrappedSchema: EducationalContent,
  wrap: (value) => value,
  unwrap: (value) => value,
})

export const schemaRegistry: Record<string, Schema | undefined> =
  Object.fromEntries(
    [
      TruthValue,
      InlineRichText,
      ContentRichText,
      FillInTheBlankRichText,
      TextContent,
      FillInTheBlankExercise,
      MultipleChoiceExercise,
      EducationalContent,
      Root,
    ].map((schema) => [schema.name, schema]),
  )
