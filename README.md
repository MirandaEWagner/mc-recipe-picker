# M&C · What's for dinner?

A warm, minimal dinner picker made from M&C's favorite recipes. Press **Choose Recipes** for three recipes drawn from three different spreadsheet tabs. Each card opens the corresponding recipe link in a new tab.

## Recipe data

`dist/recipes.json` is a snapshot imported from the supplied workbook, using titles from Column A and links from Column B of the same row. Embedded Excel hyperlinks take priority over displayed labels. Only titles, links and tab names are included; notes, ratings and other spreadsheet columns are omitted.

The initial import contains 1,513 recipe entries across 13 tabs. Global and Meal Prep had no usable title/link pairs. Fifty named rows without valid web links were skipped. Existing recipe websites may require subscriptions or may have changed since the workbook was created.

With All cuisines selected, every draw samples three tabs uniformly without replacement, then one recipe within each chosen tab. The dropdown lets you choose up to three spreadsheet categories. One selection gives three different recipes from that tab; two selections include both tabs with a random third recipe; three selections give one recipe per tab. Recipes may recur on later clicks. No diet filtering is applied.

## Update the recipes

This site uses an imported snapshot, not a live connection to the file on your computer. After editing the workbook, run:

```sh
python3 scripts/import_recipes.py '/path/to/updated-recipes.xlsx'
```

Commit and push the updated `dist/recipes.json`. GitHub Pages redeploys automatically after pushes to `main`. The original workbook does not need to be uploaded.

## Preview locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No dependencies or build step required.

## Hosting

The GitHub Actions workflow publishes `dist/` to GitHub Pages. In repository Settings → Pages, the source should be **GitHub Actions**. The `.openai/hosting.json` manifest also supports the companion Sites deployment; GitHub pushes update GitHub Pages only.
