import { parse } from '@jstream/flower'
import { addTodoActionCreator } from '@playground/redux/actions'

const config = parse({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      graph: 'fetch',
      side_effects: [
        {
          func: flow => node => context => fetch('https://api.chucknorris.io/jokes/random').then(x => x.json()),
        },
      ],
    },
    {
      graph: 'add',
      side_effects: [
        {
          func: flow => node => context =>
            addTodoActionCreator({
              id: context.id,
              text: context.value,
            }),
        },
      ],
    },
    {
      name: 'add-random',
      graph: 'fetch:add',
      rules: [
        {
          node_name: 'fetch',
          next: () => () => () => 'add',
        },
      ],
    },
  ],
})
