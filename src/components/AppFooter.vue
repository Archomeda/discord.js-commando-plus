<!--
Original file by hydrabolt at https://github.com/hydrabolt/discord.js-site/blob/master/src/components/Stats.vue
Modified by Archomeda:
 - Change references
 - Remove discord.js stats
-->

<template>
  <footer>
    <container>
      <strong><router-link to="/">discord.js-commando-plus</router-link></strong>
    </container>
  </footer>
</template>

<script>
  export default {
    name: 'footer',
  };
</script>

<style lang="scss">
  @import '../styles/theming';

  footer {
  	padding: 3rem;
  	background: $color-navbar-bg;
    color: $color-footer-text;

    a {
      text-decoration: none;
      color: $color-footer-text;
    }

    a:hover {
      color: lighten($color-footer-text, 10%);
    }

    .container {
      text-align: center;
    }

    .stats {
  		padding: 0;
      list-style: none;

      li {
        display: inline-block;

        &:not(:last-child):after {
          content: ','
        }
      }
    }
  }
</style>
