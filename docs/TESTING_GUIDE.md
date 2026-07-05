# Manual Testing Guide

This guide explains how to test the Syntactic Analysis Tool with the 50
self-created sentences in [`tests/test_cases.json`](../tests/test_cases.json).
The dataset is intended for repeatable functional testing, not for model
training or as a claim that only one parse is linguistically valid.

## What the dataset covers

The cases progress from short simple sentences to coordinated and embedded
clauses. Together they exercise:

- subject and object noun phrases (`NP`)
- verb phrases (`VP`) and prepositional phrases (`PP`)
- adjective and adverb phrases (`ADJP`, `ADVP`)
- auxiliary verbs and verb groups (`AUX`, `Vgp`)
- transitive, intransitive, linking, and ditransitive verbs
- simple, compound, complex, and compound-complex structures
- complement, relative, temporal, causal, and conditional clauses

## Test environment

Record these details before a test run:

| Field | Value |
| --- | --- |
| Date and time | |
| Tester | |
| Git commit or app version | |
| Browser and version | |
| Frontend URL | |
| Backend URL | |
| Model version | `SAT-Project/SAT-Model-T1` unless changed |

Start the backend and frontend as described in the project README. Confirm that
the backend root endpoint and `/docs` load before testing the browser UI.

## Run each test case

For every object in `tests/test_cases.json`:

1. Open the **Syntax Analysis** tab.
2. Replace the input with the exact `sentence` value from the case.
3. Click **Analyze Syntax** once.
4. Confirm the button shows a loading state and cannot be clicked again while
   the request is running.
5. Confirm the result appears without a raw network, CORS, server, or timeout
   error.
6. Compare the visible parse with `expected_structure_note`:
   - The S-expression should be present and structurally balanced.
   - The tree should contain the sentence's words in the expected order.
   - Major `NP`, `VP`, `PP`, `ADJP`, `ADVP`, `AUX`, `Vgp`, and `S` nodes should
     appear when the test note calls for them.
7. Open each result tab and check POS, Phrase, Clause, and Sentence Type output.
8. Click terminal tree nodes and confirm the corresponding words are
   highlighted.
9. Open **Analysis History** and confirm the new result is first in the list.
10. Click **View** and confirm the saved S-expression and tree reopen correctly.
11. Record the outcome before moving to the next case.

Do not mark a case as failed only because the model produced a different but
defensible parse. Mark it for review and explain the difference in the notes.

## Pass and review criteria

Mark a case **Pass** when:

- the request completes and returns `sentence`, `s_expression`, and `tree`
- the input words and major constituents are represented coherently
- the extracted result tabs reflect the returned tree
- the tree renders and node highlighting works
- the result is saved and can be reopened from Analysis History

Mark a case **Fail** when:

- the application crashes or exposes a raw technical error
- the response is missing required fields
- the tree cannot render or loses input words
- the extracted tabs contradict the returned tree
- history actions corrupt or lose unrelated records

Use **Review** when the application works but the linguistic parse differs from
the expected note and requires human evaluation.

## Result record

Use one row per test case. This table can be copied into a spreadsheet or issue
tracker.

| Case ID | Status | Response time | Sentence type shown | Major nodes observed | History verified | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Pass / Fail / Review | | | | Yes / No | |

For failures, also capture the browser console message and backend log around
the same time. Do not include access tokens or `.env` contents in test records.

## Feature checks outside the dataset

Run these checks once per release:

### Error handling

1. Stop the backend temporarily.
2. Submit a sentence.
3. Confirm the UI shows a friendly service-unavailable message.
4. Confirm technical details appear only in the developer console.
5. Restart the backend and confirm analysis works again.

### Analysis History

1. Analyze at least three different sentences.
2. Confirm the latest result appears first.
3. Delete the middle result and confirm the other two remain.
4. Click **Clear All**, cancel the confirmation, and confirm nothing is removed.
5. Click **Clear All** again, accept the confirmation, and confirm the empty
   state appears.
6. Refresh the browser and confirm the cleared state remains.

### Responsive layout

Check the Syntax Analysis, Analysis History, and How to Use tabs at desktop and
mobile widths. Buttons, result cards, long sentences, and the syntax tree
should remain usable without hiding required actions.

## Suggested execution order

1. Run all easy cases as a smoke test.
2. Run medium cases to check modifiers, auxiliaries, and coordination.
3. Run hard cases to inspect embedded and relative clauses.
4. Re-run every failed case once before reporting it.
5. Summarize pass, fail, and review totals by difficulty.
