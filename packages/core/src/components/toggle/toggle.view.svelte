<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { Switch } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let text: BehaviorSubject<string>;
  export let checked: BehaviorSubject<boolean>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<ViewContainer {title}>
  <Switch bind:checked={$checked} disabled={$disabled} text={$text} />
</ViewContainer>
