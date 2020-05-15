module.exports = {

  apiEndpoint: 'https://raymondhomepage.prismic.io/api/v2',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver: function(doc, ctx) {
    if (doc.type == 'page') {
        return '/' + doc.uid;
    }
    return '/';
  },
  htmlSerializer: function(element, content, children) {
		switch(element.type) {
			case Elements.preformatted: 
				return children.join('');
			case Elements.hyperlink:
				// assuming links will only have one potential span child
				var childElement = children[0];
				var hasClass = false;
				// test if this child has a class
				if (childElement.includes('class=')){
					// probably stupid way of finding out what that class is.
					// afaik prismic uses class="blah" but I want to allow for the potential of class='blah'
					if (childElement.includes('class="')) {
						hasClass = childElement.split('"')[1];
					} else if (childElement.includes("class='")) {
						hasClass = childElement.split("'")[1];
					}
				}
				var elementClass = (hasClass) ? `class="${hasClass}"` : '';
				var target = element.data.target ? 'target="' + element.data.target + '" rel="noopener"' : '';
				var linkUrl = PrismicDOM.Link.url(element.data, module.exports.linkResolver);

				if (hasClass) return '<a ' + elementClass + target + ' href="' + linkUrl + '">' + content + '</a>';
				return `<a ${target} href="${linkUrl}">${children.join('')}</a>`;
				
			default: return null;
		}
	},

	expandBlockSerializer: function(element, content, children) {
		switch(element.type) {
			case Elements.paragraph:
				const text = children.join('');
				const truncatedText = truncateString(text, 150, '...');
				return '<p>' + truncatedText + '</p>';
			default: return null;
		}
	}
};
