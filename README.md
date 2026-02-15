# Graph Weights

An interactive web page for visualizing and adjusting weights on graph edges.

## Features

- Select from predefined graphs: Triangle, Square, Pentagon, Hexagon, Petersen Graph, Complete Graph on 10 Vertices.
- Each edge starts with weight 1.
- Left-click on an edge to increase its weight by 1 (max 20).
- Right-click on an edge to decrease its weight by 1 (min 1).
- Each vertex displays the sum of the weights of its incident edges.

## Setup as GitHub Page

1. Create a new repository on GitHub.
2. Push this project to the repository.
3. Go to the repository settings.
4. Scroll to "Pages" section.
5. Under "Source", select "Deploy from a branch".
6. Choose the main branch (or master) and the root folder.
7. Save, and the page will be available at `https://<username>.github.io/<repository-name>/`.

## Technologies

- D3.js for graph visualization and interaction.
- HTML, CSS, JavaScript.

## Future Features

- Additional graph types.
- Save/load configurations.
- More interactive elements.