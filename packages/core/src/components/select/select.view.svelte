<script lang="ts">
  import { Select } from '@marcellejs/design-system';
  import { ViewContainer } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let options: BehaviorSubject<string[]>;
  export let value: BehaviorSubject<string>;

  function updateStream({ detail }: CustomEvent) {
    value.next(detail);
  }
</script>

<ViewContainer {title}>
  <Select options={$options} value={$value} on:change={updateStream} />
</ViewContainer>
