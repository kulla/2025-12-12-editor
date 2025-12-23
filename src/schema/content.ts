import {
  createArray,
  createBoolean,
  createObject,
  createRichText,
  createUnion,
  createWrapper,
} from './kinds'
import { RichTextFeature } from './rich-text'

enum ContentType {
  Text = 'text',
  FillInTheBlank = 'fill-in-the-blank',
}

const BooleanSchema = createBoolean({ name: 'Boolean' })

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
  wrapIso: {
    to: (value) => ({ type: ContentType.Text, content: value }),
    from: (value) => value.content,
  },
})

const FillInTheBlankExercise = createWrapper({
  name: 'FillInTheBlankExercise',
  wrappedSchema: FillInTheBlankRichText,
  wrapIso: {
    to: (value) => ({ type: ContentType.FillInTheBlank, content: value }),
    from: (value) => value.content,
  },
})

export const MultipleChoiceExercise = createObject({
  name: 'MultipleChoiceExercise',
  properties: {
    question: InlineRichText,
    options: createArray({
      name: 'MultipleChoiceOptions',
      itemSchema: createObject({
        name: 'MultipleChoiceOption',
        properties: {
          isCorrect: BooleanSchema,
          text: InlineRichText,
        },
        keyOrder: ['isCorrect', 'text'],
      }),
    }),
  },
  keyOrder: ['question', 'options'],
})

const EducationalContent = createUnion({
  name: 'EducationalContent',
  options: [TextContent, FillInTheBlankExercise, MultipleChoiceExercise],
  getOption: (value) => {
    if ('type' in value) {
      if (value.type === ContentType.Text) {
        return TextContent
      } else {
        return FillInTheBlankExercise
      }
    } else {
      return MultipleChoiceExercise
    }
  },
})

export const Root = createWrapper({
  name: 'Root',
  wrappedSchema: EducationalContent,
  wrapIso: { to: (value) => value, from: (value) => value },
})
