require "net/http"
require "uri"

module Jekyll
	class WebCatTag < Liquid::Tag
		def initialize(tag_name, fileUrl, tokens)
			super
			@fileUrl = URI.parse(fileUrl.strip)
		end

		def render(context)
			res = Net::HTTP.get_response(@fileUrl)
			if res.kind_of? Net::HTTPSuccess
				res.body.strip
			else
				raise "Cannot download resource: #{@fileUrl}. #{res.body}."
			end
		end
	end
end

Liquid::Template.register_tag('webcat', Jekyll::WebCatTag)
