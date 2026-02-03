# Shared Memory Album Design

A minimalist memory album app for long-distance couples.

## Core Concept

Two people share one space—like a joint account for memories. Both users see the same albums, contribute to the same photos, and experience the same view. No "my albums" vs "your albums"—just "our memories."

## Visual Identity

- Dark backgrounds but not pure black—soft charcoal or warm dark gray
- Warm accents—cream, soft gold, or muted amber
- White or off-white text
- Nostalgic feel, like old photographs in a dimly lit room

## Navigation Flow

```
Timeline (list of album names)
    ↓ tap album name
Album Grid (masonry layout)
    ↓ tap photo
Photo View (cinematic, full-screen)
```

Tap outside to go back at any level. No visible back buttons.

---

## Screens

### 1. Timeline (Home)

A vertical list of album names. Nothing else—no thumbnails, no dates, no photo counts.

**Layout:**
- Clean typography (serif or elegant sans-serif)
- Generous vertical spacing
- Left-aligned or centered names
- Floating "+" button in bottom corner

**Interactions:**
- Scroll to browse albums
- Tap album name → enter grid
- Tap "+" → create new album

**Empty state:**
Single line of warm text ("Your first memory awaits") with the "+" button.

### 2. Album Grid

Masonry grid of photos sized by aspect ratio. Images sit edge-to-edge in a flowing layout.

**Header:**
- Small floating header with album name
- Tap header → reveal details panel (name, date, location, delete)

**Grid:**
- No borders around photos
- Minimal gaps between images
- "+" tile at the end to add photos

**Empty album:**
Centered "+" tile with prompt to add first photos.

### 3. Photo View

Photo fills screen on pure black background. Nothing else visible.

**Viewing:**
- Swipe left/right to navigate between photos
- Smooth fade or slide transitions
- Photos centered, aspect ratio preserved

**Caption:**
- Tap photo to reveal caption at bottom
- Soft warm text on slight dark gradient
- Tap again to hide
- Tap caption area to edit or delete photo

**Navigation:**
- Tap outside photo (black bars) to return to grid
- Or swipe down

---

## Flows

### Creating an Album

1. Tap "+" on timeline
2. Minimal text input for album name
3. Type name, press create
4. Immediately inside empty album

### Adding Photos

1. Inside album, tap "+" tile in grid
2. System photo picker opens
3. Select photos (up to ~50 per album)
4. Photos upload and appear in grid

### Album Details

Tap album name header in grid view to reveal:
- Name (editable)
- Date (optional)
- Location (optional)
- Delete album (with confirmation)

### Photo Caption & Deletion

1. Tap photo to view full-screen
2. Tap to reveal caption
3. Tap caption area to edit
4. Delete option available in edit mode

---

## Data Model (Convex)

### Albums Table

```typescript
albums: defineTable({
  name: v.string(),
  date: v.optional(v.string()),
  location: v.optional(v.string()),
})
```

### Photos Table

```typescript
photos: defineTable({
  album_id: v.id("albums"),
  file_id: v.id("_storage"),
  caption: v.optional(v.string()),
  order: v.number(),
}).index("by_album", ["album_id"])
```

### File Storage

Use Convex built-in file storage for images.

### Users

Keep existing authentication system.

---

## What Gets Removed

- Heartbeat timer component
- Emotion selector component
- Updates panel component
- Navigation tabs (Home/Emotions/Actions)
- Updates table in database
- HeartbeatConfig table in database

---

## Constraints

- ~50 images per album maximum
- Albums automatically shared between both users
- Single caption field per photo (text only)
- No image editing/filters—photos displayed as uploaded

---

## Open Questions

None currently—ready for implementation planning.
