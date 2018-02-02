<!--
 Original author: hydrabolt
 Modified by: Archomeda
 - Include Archomeda/discord.js-commando-plus related documentation
 - Remove irrelevant documentation sources
-->

<template>
  <div id="docs">
    <docs-navbar :sources="sources" :source="source" />
    <router-view :source="source" :tag="tag" :darkMode="darkMode" @toggleDarkMode="toggleDarkMode" @setRepository="setRepository" />
  </div>
</template>

<script>
  import CommandoPlusSource from '../../data/CommandoPlusSource';
  import DocsNavbar from '../docs/Navbar.vue';

  export default {
    name: 'documentation',
    props: ['darkMode'],
    components: {
      DocsNavbar,
    },

    data() {
      return {
        sources: {
          [CommandoPlusSource.id]: CommandoPlusSource,
        },
        source: CommandoPlusSource,
        tag: CommandoPlusSource.defaultTag,
      };
    },

    methods: {
      setSource(id) {
        this.source = this.sources[id];
      },

      setTag(tag) {
        this.tag = tag;
        this.source.recentTag = tag;
      },

      handleRoute(route) {
        // Set the source, or redirect to a default route
        if (route.params.source && this.sources[route.params.source]) {
          this.setSource(route.params.source);
        } else {
          this.$router.replace({ name: 'docs-file', params: {
            source: CommandoPlusSource.id,
            tag: CommandoPlusSource.defaultTag,
            category: CommandoPlusSource.defaultFile.category,
            file: CommandoPlusSource.defaultFile.id,
          } });
          return;
        }

        // Set the tag, or redirect to a default route
        if (route.params.tag) {
          this.setTag(route.params.tag);
        } else {
          this.$router.replace({ name: 'docs-file', params: {
            source: this.source.id,
            tag: this.source.recentTag || this.source.defaultTag,
            category: this.source.defaultFile.category,
            file: this.source.defaultFile.id,
          } });
          return;
        }

        // Redirect to a default route
        if (!route.params.file && !route.params.class && !route.params.typedef && route.name !== 'docs-search') {
          this.$router.replace({ name: 'docs-file', params: {
            source: this.source.id,
            tag: this.tag,
            category: this.source.defaultFile.category,
            file: this.source.defaultFile.id,
          } });
        }
      },

      toggleDarkMode() {
        this.$emit('toggleDarkMode');
      },

      setRepository(repo) {
          this.$emit('setRepository', repo);
      },
    },

    watch: {
      $route(to) {
        this.handleRoute(to);
      },
    },

    created() {
      this.handleRoute(this.$route);
    },
  };
</script>
