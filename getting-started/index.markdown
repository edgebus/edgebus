---
layout: default
nav_order: 2
title: Getting Started
description: "TBD"
has_children: true
---

```js
{% webcat https://raw.githubusercontent.com/cexiolabs/cexpay.schemas/master/processing/v3/fund.json %}
```

---

```js
{% cat _includes/mermaid_config.js %}
```

---

```js
export interface Dto {
  readonly flow: 'standard';
  readonly type: 'direct';
}
```


