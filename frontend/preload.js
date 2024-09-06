window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }

    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      link.href = '.' + link.getAttribute('href');
    });

    // fix the script paths
    document.querySelectorAll('script').forEach(script => {
      script.src = '.' + script.getAttribute('src');
    });
  }) 
