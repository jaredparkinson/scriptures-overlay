import { of } from 'rxjs';
import { filter, map, flatMap, toArray, take } from 'rxjs/operators';
import { appSettings, store } from '../SettingsComponent';
import { flatMap$ } from '../../oith-lib/src/rx/flatMap$';
import { Note, NoteRef } from '../../oith-lib/src/verse-notes/verse-note';
import { NoteType } from '../../oith-lib/src/verse-notes/settings/note-gorup-settings';
import FileSaver from 'file-saver';
import { sortBy } from 'lodash';
import { Chapter } from '../../oith-lib/src/models/Chapter';

function noteRefsToString(noteRefs: NoteRef[]) {
  return noteRefs.map(noteRef => {
    const noteCategory = appSettings.noteCategories.noteCategories.find(
      nc => nc.category === noteRef.category,
    );
    if (noteCategory) {
      return `<p class="note-reference"><span class="${noteCategory.className}">${noteCategory.name} </span>${noteRef.text}</p>`;
    }
  });
}

function notesToString(note: Note, noteTypes: NoteType[]) {
  const noteType = noteTypes.find(
    noteType => noteType.noteType === note.noteType,
  );
  if (noteType) {
    return `<note class="${noteType.className}" id="${note.id}" offsets="${
      note.formatTag.offsets
    }"><p class="note-phrase">${note.phrase}</p>${noteRefsToString(
      note.ref,
    ).join('')}</note>`;
  }
}

function verseNotesFromShell(chapter: Chapter) {
  const verseNotes = chapter.verses
    .map(verse =>
      chapter.verseNotes
        ? chapter.verseNotes.find(vN =>
            vN.id.includes(`-${verse.id}-verse-notes`),
          )
        : undefined,
    )
    .filter(vN => vN !== undefined);
  return verseNotes;
}
const docstart = (id: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><html data-content-type="overlay-note" lang="eng"><head><meta charset="UTF-8"/></head><body><chapter id="${id}">`;
const docend = `</chapter></body></html>`;
export function exportNotes() {
  return of(document.querySelectorAll('.checked-overlay')).pipe(
    flatMap(o => o),
    map(o => o.className.split(' ')),
    flatMap$,
    filter(o => o.startsWith('overlay')),
    map(o =>
      appSettings.noteTypes.noteTypes.find(
        noteType => noteType.className === o,
      ),
    ),
    filter(o => o !== undefined),
    toArray(),
    map(noteTypes => {
      return store.chapter.pipe(
        take(1),
        filter(o => o !== undefined),
        map(chapter => {
          if (chapter.verseNotes) {
            const fileTxt = `${docstart(chapter.id)}${verseNotesFromShell(
              chapter,
            )
              .map(verseNote => {
                return `<verse-notes id="${verseNote.id}">${verseNote.notes
                  .map(note => notesToString(note, noteTypes))
                  .join('')}</verse-notes>`;
              })
              .join('')}${docend}`;

            const blob = new Blob([fileTxt], {
              type: 'text/html;charset=utf=8',
            });

            FileSaver.saveAs(blob, 'test.xml');
            return fileTxt;
          }
          return '';
        }),
      );
    }),
    flatMap$,
  );
}