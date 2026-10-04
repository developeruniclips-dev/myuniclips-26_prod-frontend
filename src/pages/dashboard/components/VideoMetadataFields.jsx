import { Form } from 'react-bootstrap';

export const characterCount = value => [...(value || '').replace(/\r\n?/g, '\n')].length;
export function metadataError(title, description, limits) {
  if (!limits?.maxTitleCharacters || !limits?.maxDescriptionCharacters) return 'Text limits are unavailable. Please refresh before saving.';
  if (!title.trim()) return 'Please enter a video title.';
  if (characterCount(title) > limits.maxTitleCharacters) return `Video title must contain at most ${limits.maxTitleCharacters} characters.`;
  if (characterCount(description) > limits.maxDescriptionCharacters) return `Description must contain at most ${limits.maxDescriptionCharacters.toLocaleString('en-US')} characters.`;
  return '';
}

export default function VideoMetadataFields({ title, description, onTitleChange, onDescriptionChange, limits }) {
  return <>{[
    { id: 'lesson-title', label: 'Video Title', value: title, limit: limits?.maxTitleCharacters, change: onTitleChange, as: 'input' },
    { id: 'lesson-description', label: 'Description', value: description, limit: limits?.maxDescriptionCharacters, change: onDescriptionChange, as: 'textarea' }
  ].map(field => {
    const count = characterCount(field.value);
    const exceeded = field.limit != null && count > field.limit;
    return <Form.Group className="mb-4" controlId={field.id} key={field.id}>
      <Form.Label className="fw-semibold">{field.label}{field.as === 'input' && ' *'}</Form.Label>
      <Form.Control as={field.as} type={field.as === 'input' ? 'text' : undefined} rows={field.as === 'textarea' ? 4 : undefined}
        value={field.value} onChange={event => field.change(event.target.value)} required={field.as === 'input'}
        isInvalid={exceeded} aria-invalid={exceeded} aria-describedby={`${field.id}-count ${field.id}-error`} />
      <Form.Text id={`${field.id}-count`} className="d-block">{count.toLocaleString('en-US')} / {field.limit?.toLocaleString('en-US') || '…'} characters</Form.Text>
      {exceeded && <div id={`${field.id}-error`} role="alert" className="text-danger small">{field.label} exceeds the {field.limit.toLocaleString('en-US')}-character limit. Please shorten it before saving.</div>}
    </Form.Group>;
  })}</>;
}
