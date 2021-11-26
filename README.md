### Context
This is a Tab opener script built around Firefox (yet to complete for Chrome).

I used the extension Copy As Markdown (https://addons.mozilla.org/en-US/firefox/addon/copy-as-markdown/) on Firefox to get all the open tabs in my
current browser window.


### Usage
You would use this script as you would run any other NodeJS file.

Go to the directory in which the script is present and execute the following commands.

```
> npm install
> node index.js <URL-file-name>
```

### Configuring your URL file
The URL file in the above command will have a list of all the URLs that you
want to open in Firefox. As mentioned above, I used an extension. On the other hand, if you already have a newline separated list of URLs, that is
also fine.

The `Test_URLs_List` file has a couple of URLs that show you the format this program expects the URLs to be.

In the `Test_URLs_List`, you will notice that some URLs are separated by an empty line. I call this grouping of URLs. More on this in the next section.

### What is grouping

More often than not, I have not only had many tabs in a single browser window, I have had *multiple* browser windows as well. Now, in order to have the same setup I had earlier, I need all the browser windows to be the same as well.

Introduce "grouping", a concept I am using to group together URLs in a single window. In a file containing multiple groups, all the URLs that are separated by a newline character will belong to a single group. For example:
```
www.google.com
www.yahoo.com
www.bing.com
```
belong to the same group. All of them will open in a single window.

Different groups are separated from one another using a blank line. For example,
```
www.google.com
www.yahoo.com
www.bing.com

www.duckduckgo.com
wwww.baidu.com
```

Here, we have 2 groups. In the first group we have:
- `www.google.com`
- `www.yahoo.com`
- `www.bing.com`

And in the 2nd group, we have
- `www.duckduckgo.com`
- `www.baidu.com`

These 2 groups will be opened in separate windows.

Due to Firefox having weird command-line execution, I have to use a few hacks. Hopefully, the process will be easier for chrome.