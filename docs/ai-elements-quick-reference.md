# AI Elements Quick Reference

**For**: Floating Chat Bubble Enhancement  
**Branch**: `feature/ai-elements-chat-ui`

---

## Installation Status

Run this command to install:

```bash
pnpm dlx ai-elements@latest
```

When prompted:

- Press Enter to accept default path
- Select **Yes** to overwrite existing components

---

## Component Mapping

### Current → AI Elements

```typescript
// BEFORE: Custom implementation
<div className="message-list">
  {messages.map(msg => (
    <div className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
      <Response>{msg.content}</Response>
    </div>
  ))}
</div>

// AFTER: AI Elements
<Conversation>
  <ConversationContent>
    {messages.map(msg => (
      <Message from={msg.role}>
        <MessageContent>
          <MessageResponse>{msg.content}</MessageResponse>
        </MessageContent>
      </Message>
    ))}
  </ConversationContent>
</Conversation>
```

---

## Key Components

### 1. Conversation

```typescript
import { Conversation } from "@/components/ai-elements/conversation"

// Container with auto-scroll
<Conversation>
  {/* messages */}
</Conversation>
```

### 2. ConversationContent

```typescript
import { ConversationContent } from "@/components/ai-elements/conversation"

// Wrapper for message list
<ConversationContent>
  {messages.map(...)}
</ConversationContent>
```

### 3. ConversationEmptyState

```typescript
import { ConversationEmptyState } from "@/components/ai-elements/conversation"

// Empty state UI
{messages.length === 0 && (
  <ConversationEmptyState
    title="Start a conversation"
    description="Type a message below to begin"
  />
)}
```

### 4. Message

```typescript
import { Message } from "@/components/ai-elements/message"

// Individual message container
<Message from="user" | "assistant">
  {/* content */}
</Message>
```

### 5. MessageContent

```typescript
import { MessageContent } from "@/components/ai-elements/message"

// Message content wrapper
<MessageContent>
  {/* text, markdown, etc */}
</MessageContent>
```

### 6. MessageResponse

```typescript
import { MessageResponse } from "@/components/ai-elements/message"

// Enhanced markdown renderer
<MessageResponse>
  {message.content}
</MessageResponse>
```

### 7. PromptInput Components

```typescript
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit
} from "@/components/ai-elements/prompt-input"

<PromptInput onSubmit={handleSubmit}>
  <PromptInputTextarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type your message..."
  />
  <PromptInputSubmit disabled={isLoading} />
</PromptInput>
```

---

## Import Patterns

### Conversation Components

```typescript
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
```

### Message Components

```typescript
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
```

### Input Components

```typescript
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
```

---

## Integration with useChat

```typescript
const { messages, sendMessage, status } = useChat({
  id: chatId,
  transport: new DefaultChatTransport({
    api: "/api/create",
    // ... config
  }),
});

const isLoading = status === "streaming" || status === "submitted";
```

### Status Values

- `"ready"` - Ready for input
- `"submitted"` - Message sent, waiting for response
- `"streaming"` - Receiving streamed response
- `"error"` - Error occurred

---

## Styling Patterns

### Theme Integration

AI Elements uses shadcn/ui CSS variables:

```css
/* Already configured in your theme */
--primary
--muted
--foreground
--background
--border
```

### Custom Styling

```typescript
// Components accept className prop
<Message className="custom-class" from="user">
  ...
</Message>
```

---

## Message Parts Handling

```typescript
// AI SDK v5 message structure
message.parts.map((part) => {
  if (part.type === "text") {
    return <MessageResponse>{part.text}</MessageResponse>;
  }
  if (part.type === "tool-call") {
    return <Tool data={part} />;
  }
  // ... handle other part types
})
```

---

## Streaming States

### Show Loading Indicator

```typescript
{(status === "streaming" || status === "submitted") && (
  <div className="flex justify-start">
    <div className="bg-muted rounded-lg px-3 py-2">
      <Loader /> {/* or custom loading animation */}
    </div>
  </div>
)}
```

### Disable Input During Streaming

```typescript
<PromptInputTextarea
  disabled={status === "streaming" || status === "submitted"}
  // ...
/>
```

---

## Common Patterns

### Role-Based Message Display

```typescript
{messages.map((message) => (
  <Message
    key={message.id}
    from={message.role === "user" ? "user" : "assistant"}
  >
    <MessageContent>
      {message.parts.map(part =>
        part.type === "text" && (
          <MessageResponse>{part.text}</MessageResponse>
        )
      )}
    </MessageContent>
  </Message>
))}
```

### Empty State with Suggestions

```typescript
{messages.length === 0 && (
  <ConversationEmptyState
    title="AI Editing Assistant"
    description="Request suggestions, revisions, and make changes to your obituary"
  />
)}
```

### Submit Handler

```typescript
const handleSubmit = (message: PromptInputMessage, event: FormEvent) => {
  event.preventDefault();
  if (message.text) {
    sendMessage({ text: message.text });
    setInput("");
  }
};
```

---

## Additional Components (Future)

### Tool Display

```typescript
import { Tool } from "@/components/ai-elements/tool";

<Tool
  name="search"
  status="in-progress" | "completed"
  data={toolData}
/>
```

### Reasoning Display

```typescript
import { Reasoning } from "@/components/ai-elements/reasoning";

<Reasoning>
  {reasoningContent}
</Reasoning>
```

### Code Block

```typescript
import { CodeBlock } from "@/components/ai-elements/code-block";

<CodeBlock language="typescript">
  {code}
</CodeBlock>
```

---

## Troubleshooting

### Components Not Found

```bash
# Reinstall AI Elements
pnpm dlx ai-elements@latest

# Or install specific component
pnpm dlx ai-elements@latest add conversation
```

### Styling Issues

- Ensure shadcn/ui is initialized: `npx shadcn@latest init`
- Check CSS Variables mode is enabled in `tailwind.config.ts`
- Verify `globals.css` includes shadcn/ui base styles

### Type Errors

```typescript
// Ensure AI SDK types are available
import type { Message as AIMessage } from "ai";

// Use proper message part types
part.type === "text"; // string type for part.text
part.type === "tool-call"; // ToolCallPart
```

---

## Testing Checklist

### Visual

- [ ] Messages render with correct styling
- [ ] User/AI messages visually distinct
- [ ] Markdown renders properly (bold, lists, code)
- [ ] Auto-scroll works during streaming
- [ ] Empty state displays correctly
- [ ] Input resizes with content

### Functional

- [ ] Send message on Enter key
- [ ] Send message on button click
- [ ] Streaming displays correctly
- [ ] Loading states show/hide properly
- [ ] Error messages display
- [ ] Scroll position maintains on new messages

### Edge Cases

- [ ] Very long messages (>1000 chars)
- [ ] Messages with code blocks
- [ ] Messages with markdown tables
- [ ] Multiple rapid messages
- [ ] Network errors during streaming

---

## Quick Diff Example

### Before (Custom)

```tsx
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <Response>{message.content}</Response>
      </div>
    </div>
  ))}
</div>
```

### After (AI Elements)

```tsx
<Conversation>
  <ConversationContent>
    {messages.map((message) => (
      <Message key={message.id} from={message.role}>
        <MessageContent>
          <MessageResponse>{message.content}</MessageResponse>
        </MessageContent>
      </Message>
    ))}
  </ConversationContent>
</Conversation>
```

**Benefits**:

- 60% less code
- Built-in auto-scroll
- Better accessibility
- Professional styling
- Markdown support out of the box

---

## Resources

- [AI Elements Docs](https://ai-sdk.dev/elements/overview)
- [Component Registry](https://registry.ai-sdk.dev/)
- [GitHub Examples](https://github.com/vercel/ai-elements/tree/main/apps/playground)
- [Full PRD](./prd-ai-elements-chat-ui.md)
