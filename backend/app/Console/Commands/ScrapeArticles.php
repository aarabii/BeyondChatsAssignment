<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use App\Models\Article;

class ScrapeArticles extends Command
{
    protected $signature = 'scrape:articles';

    protected $description = 'Scrape articles from BeyondChats and save to database';

    public function handle()
    {
        $this->info('Starting scraper...');

    $url = 'https://beyondchats.com/blogs/';
    $response = Http::get($url);

    if ($response->failed()) {
        $this->error('Failed to connect to BeyondChats.');
        return;
    }

    $html = $response->body();
    $crawler = new Crawler($html);

    // TARGETED SELECTOR: We are looking for <article> tags with class "entry-card"
    $crawler->filter('article.entry-card')->each(function (Crawler $node) {

        try {
            // 1. Extract Title
            $title = $node->filter('h2.entry-title')->text();

            // 2. Extract Link
            $link = $node->filter('a.ct-media-container')->attr('href');

            // 3. Extract Image
            // We check if an image exists to prevent errors
            $image = null;
            if ($node->filter('.ct-media-container img')->count() > 0) {
                $image = $node->filter('.ct-media-container img')->attr('src');
            }

            // 4. Extract Description
            $description = $node->filter('.entry-excerpt')->text('');

            // 5. Extract Author
            // Inside .meta-author there is a span with the name
            $author = 'BeyondChats Team';
            if ($node->filter('.meta-author span')->count() > 0) {
                $author = $node->filter('.meta-author span')->text();
            }

            // Check for duplicates
            if (Article::where('url', $link)->exists()) {
                $this->line("Skipping existing: $title");
                return;
            }

            // 6. Visit Single Page for Full Content
            $this->info("Fetching full content for: $title");
            $singlePageResponse = Http::get($link);

            if ($singlePageResponse->ok()) {
                $pageCrawler = new Crawler($singlePageResponse->body());

                // Blocksy theme usually puts content in .entry-content
                $content = $pageCrawler->filter('.entry-content')->html();

                // Save to Database
                Article::create([
                    'title' => $title,
                    'description' => $description,
                    'url' => $link,
                    'image_url' => $image,
                    'author' => $author,
                    'content' => $content
                ]);

                $this->info("Saved successfully!");
            }

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
    });

    $this->info('Scraping completed!');
  }
}
