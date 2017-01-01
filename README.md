develoop
========

This is a proof of concept for a web development tool that allows designers and developers to work together in a better way.

It is very much work in progress based on [Polymer Designer](https://github.com/Polymer/designer). Starting from the [designer1 branch](https://github.com/Polymer/designer/tree/designer1), I basically hacked its save and load functionality so that users can save the "app" being edited as a component itself, and also edit the available components in the same way. So actually there is no distinction, everything is a component (eventually) made of other components.

This way, designers can build complex apps by creating each building block one by one and gradually putting them together. Developers would support the process by coding the fine tuned behaviors that require programming. As the platform seamlessly supports coding and visual editing, everything could happen in the same place without the need of the usual abrupt division between design and development phases.

## Getting Started

1. Clone the repo and `cd` in
2. Run `bower install`
3. Run `npm install`
4. Run `node .`
5. Navigate to http://localhost:3000

Right now, to create a new component you need to toggle the code mode on by pressing the `<>` button and manually edit the `name` attribute of the `polymer-element`. Then click on the save button, and your element will be available as a new component under the `Components` category in the design palette when you switch back to design mode.

## Rough edges

- This codebase is based on Designer 1 and Polymer 0.5, which are over two years old. Somehow upgrading it should be possible, but not without a considerable amount of time.
- Components are saved in `server/components/metdata.html` without taking care of repetitions. This is ugly but doesn't really affect the tool's behavior as a proof of concept.
