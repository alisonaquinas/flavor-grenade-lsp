import Chart from './Chart'
export const title = 'MDX Smoketest'

# {title}

<Chart value={total}>
  **Markdown** inside JSX
</Chart>

{items.map((item) => <Item key={item.id} />)}
