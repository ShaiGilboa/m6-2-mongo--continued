# 5.1.3 Immer

---

In Redux, store updates **must be** immutable.

---

Spot and fix the error:

```js
const initialState = {
  name: 'Arnold',
  headShape: 'football',
  bestFriend: null,
};

function reducer(state, action) {
  if (action.type === 'MAKE_FRIEND') {
    state.bestFriend = action.gerald.firstName;
    return state;
  }
}
```

---

# Exercise

Fix mutability issues

---

```js
const initialState = {
  burgerToppings: ['lettuce', 'tomato', 'mayo'],
};

function reducer(state, action) {
  if (action.type === 'ADD_KETCHUP') {
    state.burgerToppings.push('ketchup');
    return state;
  }
}
```
```js
const initialState = {
  burgerToppings: ['lettuce', 'tomato', 'mayo'],
};

function reducer(state, action) {
  if (action.type === 'ADD_KETCHUP') {
    const newBurgerToppings = state.burgerToppings.concat('ketchup')
    return {
      ...state,
      burgerToppings: newBurgerToppings,
    }
  }
}
```
---

<Timer />

```js
const initialState = {
  raceBeganAt: '2020-03-27T12:34:56.000Z',
  competitors: {
    orangers: {
      racers: {
        clementin: {},
        tangerin: {},
      },
    },
    teamGalactic: {
      racers: {
        speedy: {},
        rapidly: {},
        swiftly: {},
      },
    },
  },
};

function reducer(state, action) {
  if (action.type === 'REMOVE_RACER_FROM_TEAM') {
    const { teamId, racerName } = action;

    delete state.competitors[teamId].racers[racerName];

    return state;
  }
}
```

---

There has to be a better way!

---

# Immer

Immer lets you _use mutable methods_ without actually mutating the original state.

---

```js
import produce from 'immer';

const state = { hi: 5 };

// BAD: mutation
state.hi = 6;

// GOOD: fake mutation with Immer
const newState = produce(state, (draftState) => {
  draftState.hi = 6;
});

console.log(newState); // { hi: 6 }
console.log(state === newState); // false
```

---

Let's try this again:

```js
const initialState = {
  name: 'Arnold',
  headShape: 'football',
  bestFriend: null,
};

function reducer(state, action) {
  if (action.type === 'MAKE_FRIEND') {
    state.bestFriend = action.gerald.firstName;
    return state;
  }
}
```

---

## Exercises

Do it again, but with Immer!

---

```js
const initialState = {
  burgerToppings: ['lettuce', 'tomato', 'mayo'],
};

function reducer(state, action) {
  if (action.type === 'ADD_KETCHUP') {
    state.burgerToppings.push('ketchup');
    return state;
  }
}
```
```js
const initialState = {
  burgerToppings: ['lettuce', 'tomato', 'mayo'],
};

function reducer(state, action) {
  if (action.type === 'ADD_KETCHUP') {
    return produce(state, draftState => {
      draftState.burgerToppings.push('ketchup');
    })
  }
}
```
---

```js
const initialState = {
  raceBeganAt: '2020-03-27T12:34:56.000Z',
  competitors: {
    orangers: {
      racers: {
        clementin: {},
        tangerin: {},
      },
    },
    teamGalactic: {
      racers: {
        speedy: {},
        rapidly: {},
        swiftly: {},
      },
    },
  },
};

function reducer(state, action) {
  if (action.type === 'REMOVE_RACER_FROM_TEAM') {
    const { teamId, racerName } = action;

    delete state.competitors[teamId].racers[racerName];

    return state;
  }
}
```
```js
const initialState = {
  raceBeganAt: '2020-03-27T12:34:56.000Z',
  competitors: {
    orangers: {
      racers: {
        clementin: {},
        tangerin: {},
      },
    },
    teamGalactic: {
      racers: {
        speedy: {},
        rapidly: {},
        swiftly: {},
      },
    },
  },
};

function reducer(state, action) {
  if (action.type === 'REMOVE_RACER_FROM_TEAM') {
    const { teamId, racerName } = action;
    return produce(state, draftState => {
      delete draftState.competitors[teamId].racers[racerName];
    })
  }
}
```
---

Immer makes our lives _much_ easier.

Feel free to use it as much or as little as you want.
