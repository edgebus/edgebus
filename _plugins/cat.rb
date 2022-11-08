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

	class CatTab1Tag < Liquid::Tag
		def initialize(tag_name, fileName, tokens)
			super
			@fileName = fileName.strip
		end

		def render(context)
			text = File.read(@fileName)
			text.lines.map.with_index{|element, index| index === 0 ? element : "\t" + element}.join().strip
		end
	end
end

Liquid::Template.register_tag('cat', Jekyll::CatTag)
Liquid::Template.register_tag('cat_tab_1', Jekyll::CatTab1Tag)
