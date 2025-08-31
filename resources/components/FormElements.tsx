'use client'

import { useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

const people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
  { id: 7, name: 'Caroline Schultz' },
  { id: 8, name: 'Mason Heaney' },
  { id: 9, name: 'Claudie Smitham' },
  { id: 10, name: 'Emil Schaefer' },
]

export default function FormElements() {
  const [selected, setSelected] = useState(people[3])

  return (
    <div className="space-y-8">
      {/* Text Input */}
      <div>
        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
          Email
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            aria-describedby="email-description"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
        <p id="email-description" className="mt-2 text-sm text-gray-500">
          We'll only use this for spam.
        </p>
      </div>

      {/* Listbox */}
      <Listbox value={selected} onChange={setSelected}>
        <Label className="block text-sm/6 font-medium text-gray-900">Assigned to</Label>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6">
            <span className="col-start-1 row-start-1 truncate pr-6">{selected.name}</span>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
          >
            {people.map((person) => (
              <ListboxOption
                key={person.id}
                value={person}
                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <span className="block truncate font-normal group-data-selected:font-semibold">{person.name}</span>

                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Textarea */}
      <div>
        <label htmlFor="comment" className="block text-sm/6 font-medium text-gray-900">
          Add your comment
        </label>
        <div className="mt-2">
          <textarea
            id="comment"
            name="comment"
            rows={4}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            defaultValue={''}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <fieldset>
        <legend className="sr-only">Notifications</legend>
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  defaultChecked
                  id="comments"
                  name="comments"
                  type="checkbox"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6">
              <label htmlFor="comments" className="font-medium text-gray-900">
                Comments
              </label>
              <p className="text-gray-500">Get notified when someone posts a comment on a posting.</p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Toggle */}
      <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
        <span className="relative size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5">
          <span
            aria-hidden="true"
            className="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out"
          >
            <svg fill="none" viewBox="0 0 12 12" className="size-3 text-gray-400">
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in"
          >
            <svg fill="currentColor" viewBox="0 0 12 12" className="size-3 text-indigo-600">
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
        <input
          name="setting"
          type="checkbox"
          aria-label="Use setting"
          className="absolute inset-0 appearance-none focus:outline-hidden"
        />
      </div>
    </div>
  )
}