import { RichTextFeature } from '../rich-text/features'
import * as S from '../schema'

export enum ContentType {
  Text = 'text',
  FillInTheBlank = 'fill-in-the-blank',
  MultipleChoice = 'multiple-choice',
}

const TruthValue = S.createTruthValue({ name: 'TruthValue' })

const InlineRichText = S.createRichText({
  name: 'InlineRichText',
  features: [RichTextFeature.Bold, RichTextFeature.Italic],
})

const ContentRichText = S.createRichText({
  name: 'ContentRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Heading,
    RichTextFeature.List,
  ],
})

const FillInTheBlankRichText = S.createRichText({
  name: 'FillInTheBlankRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Blank,
  ],
})

const TextContent = S.createWrapper({
  name: 'TextContent',
  wrappedSchema: ContentRichText,
  wrap: (value) => ({ type: ContentType.Text, content: value }),
  unwrap: (value) => value.content,
})

const FillInTheBlankExercise = S.createWrapper({
  name: 'FillInTheBlankExercise',
  wrappedSchema: FillInTheBlankRichText,
  wrap: (value) => ({ type: ContentType.FillInTheBlank, content: value }),
  unwrap: (value) => value.content,
})

const MultipleChoiceExercise = S.createObject({
  name: 'MultipleChoiceExercise',
  properties: {
    type: S.createLiteral({
      name: 'MultipleChoiceType',
      value: ContentType.MultipleChoice,
    }),
    question: InlineRichText,
    options: S.createArray({
      name: 'MultipleChoiceOptions',
      itemSchema: S.createObject({
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

const EducationalContent = S.createArray({
  name: 'EducationalContent',
  itemSchema: S.createUnion({
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
export const Root = S.createWrapper({
  name: 'Root',
  wrappedSchema: EducationalContent,
  wrap: (value) => value,
  unwrap: (value) => value,
})
