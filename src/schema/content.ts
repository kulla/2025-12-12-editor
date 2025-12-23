import {
  createArraySchema,
  createBooleanSchema,
  createObjectSchema,
  createRichTextSchema,
  createUnionSchema,
  createWrapperSchema,
} from './kinds'
import { RichTextFeature } from './rich-text'

enum ContentType {
  Text = 'text',
  FillInTheBlank = 'fill-in-the-blank',
}

const BooleanSchema = createBooleanSchema({ name: 'Boolean' })

const InlineRichText = createRichTextSchema({
  name: 'InlineRichText',
  features: [RichTextFeature.Bold, RichTextFeature.Italic],
})

const ContentRichText = createRichTextSchema({
  name: 'ContentRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Heading,
    RichTextFeature.List,
  ],
})

const FillInTheBlankRichText = createRichTextSchema({
  name: 'FillInTheBlankRichText',
  features: [
    RichTextFeature.Bold,
    RichTextFeature.Italic,
    RichTextFeature.Paragraph,
    RichTextFeature.Blank,
  ],
})

const TextContent = createWrapperSchema({
  name: 'TextContent',
  wrappedSchema: ContentRichText,
  wrapIso: {
    to: (value) => ({ type: ContentType.Text, content: value }),
    from: (value) => value.content,
  },
})

const FillInTheBlankExercise = createWrapperSchema({
  name: 'FillInTheBlankExercise',
  wrappedSchema: FillInTheBlankRichText,
  wrapIso: {
    to: (value) => ({ type: ContentType.FillInTheBlank, content: value }),
    from: (value) => value.content,
  },
})

export const MultipleChoiceExercise = createObjectSchema({
  name: 'MultipleChoiceExercise',
  properties: {
    question: InlineRichText,
    options: createArraySchema({
      name: 'MultipleChoiceOptions',
      itemSchema: createObjectSchema({
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

const EducationalContent = createUnionSchema({
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

export const Root = createWrapperSchema({
  name: 'Root',
  wrappedSchema: EducationalContent,
  wrapIso: { to: (value) => value, from: (value) => value },
})
