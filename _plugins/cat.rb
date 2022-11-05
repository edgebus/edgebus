module Jekyll
	class CatTag < Liquid::Tag
		def initialize(tag_name, fileName, tokens)
			super
			@fileName = fileName.strip
		end

		def render(context)
			text = File.read(@fileName)
			text.strip
		end
	end
end

Liquid::Template.register_tag('cat', Jekyll::CatTag)
