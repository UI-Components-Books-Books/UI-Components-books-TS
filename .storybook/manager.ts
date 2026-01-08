import { addons } from 'storybook/manager-api'
import booksTheme from './booksTheme'

addons.setConfig({
    theme: booksTheme,
    sidebar: {
        showRoots: true,
        collapsedRoots: [],
    },
    toolbar: {
        title: { hidden: false },
        zoom: { hidden: false },
        eject: { hidden: false },
        copy: { hidden: false },
        fullscreen: { hidden: false },
    },
    initialActive: 'canvas',
})