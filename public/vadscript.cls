% !TEX TS-program = XeLaTeX+MakeIndex+BibTeX
% !TEX program = XeLaTeX
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{vadscript}

%Load basic packages for latex3
\RequirePackage{expl3}
\RequirePackage{xparse}

\ExplSyntaxOn
\tl_new:N \g_vadscript_font_tl
\tl_gset:Nn \g_vadscript_font_tl {新細明體}
\dim_new:N \g_vadscript_font_size_dim
\dim_gset:Nn \g_vadscript_font_size_dim {10pt}
\dim_new:N \g_vadscript_cast_size_dim
\dim_gset:Nn \g_vadscript_cast_size_dim {11pt}
\dim_new:N \g_vadscript_index_size_dim
\dim_gset:Nn \g_vadscript_index_size_dim {12pt}
\dim_new:N \g_vadscript_date_size_dim
\dim_gset:Nn \g_vadscript_date_size_dim {12pt}
\dim_new:N \g_vadscript_title_size_dim
\dim_gset:Nn \g_vadscript_title_size_dim {16pt}
\dim_new:N \g_vadscript_subtitle_size_dim
\dim_gset:Nn \g_vadscript_subtitle_size_dim {14pt}
\bool_new:N \g_vadscript_kern_b
\bool_gset_false:N \g_vadscript_kern_b
\bool_new:N \g_vadscript_baselatin_calibri_b
\bool_gset_true:N \g_vadscript_baselatin_calibri_b
\bool_new:N \g_image_use_all_b
\bool_gset_false:N \g_image_use_all_b
%unused
%vertical supports by xeCJK is very limited (almost none!) so far...
\bool_new:N \g_text_vertical_b
\bool_gset_false:N \g_text_vertical_b
%this option is useful in text-vertical mode but...
\bool_new:N \g_paper_horizontal_b
\keys_define:nn {vadscript} {
	font .value_required:n = true,
	font .tl_gset:N = \g_vadscript_font_tl,
	fontsize .value_required:n = true,
	fontsize .dim_gset:N = \g_vadscript_font_size_dim,
	castsize .value_required:n = true,
	castsize .dim_gset:N = \g_vadscript_cast_size_dim,
	indexsize .value_required:n = true,
	indexsize .dim_gset:N = \g_vadscript_index_size_dim,
	datesize .value_required:n = true,
	datesize .dim_gset:N = \g_vadscript_date_size_dim,
	titlesize .value_required:n = true,
	titlesize .dim_gset:N = \g_vadscript_title_size_dim,
	subtitlesize .value_required:n = true,
	subtitlesize .dim_gset:N = \g_vadscript_subtitle_size_dim,
	kern .value_forbidden:n = true,
	kern .code:n = {\bool_gset_true:N \g_vadscript_kern_b},
	no-calibri .value_forbidden:n = true,
	no-calibri .code:n = {\bool_gset_false:N \g_vadscript_baselatin_calibri_b},
	all-image .value_forbidden:n = true,
	all-image .code:n = {\bool_gset_true:N \g_image_use_all_b},
	%unused
	text-vertical .value_forbidden:n = true,
	text-vertical .code:n = {\bool_gset_true:N \g_text_vertical_b},
	paper-horizontal .value_forbidden:n = true,
	paper-horizontal .code:n = {\bool_gset_true:N \g_paper_horizontal_b},
	unknown .code:n = {
		\PassOptionsToClass{\CurrentOption}{article}
	}
}

\ProcessKeyOptions[vadscript]

%Load packages after options passed
\LoadClass{article}
\RequirePackage{xeCJK}
\bool_if:NTF \g_paper_horizontal_b {
	\RequirePackage[a5paper, margin = 1.27cm, footskip = 1cm, headsep = 10pt, includefoot, landscape]{geometry}
}{
	\RequirePackage[a5paper, margin = 1.27cm, footskip = 1cm, headsep = 10pt, includefoot]{geometry}
}
\RequirePackage{setspace}
\RequirePackage{fancyhdr}
\RequirePackage{graphicx}
\RequirePackage{adjustbox}
\RequirePackage{xifthen}
\RequirePackage{enumitem}
\RequirePackage{calc}
\RequirePackage[most]{tcolorbox}
\RequirePackage{tabularx}
\RequirePackage{ltablex}
\RequirePackage{makecell}
\RequirePackage{xassoccnt}
\RequirePackage{environ}
\RequirePackage{pxrubrica}
\RequirePackage{fontsize}

\changefontsize{\g_vadscript_font_size_dim}

\keepXColumns

\setmainfont{\tl_use:N \g_vadscript_font_tl}[AutoFakeBold, Mapping = ]
\setCJKmainfont{\tl_use:N \g_vadscript_font_tl}

\bool_new:N \g_vadscript_modify_puncstyle_b
\bool_if:nTF {!\g_vadscript_kern_b} {
	\xeCJKDeclarePunctStyle {mypunctstyle} {}
	\bool_if:nTF {!\g_vadscript_kern_b} {
		\xeCJKEditPunctStyle {mypunctstyle} {enabled-kerning = false}
	}{}
	%...
	\xeCJKsetup{PunctStyle = mypunctstyle}
	\bool_gset_true:N \g_vadscript_modify_puncstyle_b
}{
	\bool_gset_false:N \g_vadscript_modify_puncstyle_b
}

% interchar
\bool_if:NTF \g_vadscript_baselatin_calibri_b {
	%\setTransitionTo{BasicLatin}{\calibri}
	\XeTeXinterchartokenstate=1
	\newXeTeXintercharclass\ASCIIclass
	\XeTeXinterchartoks 0 \ASCIIclass = {\begingroup\calibri}
	\XeTeXinterchartoks 4095 \ASCIIclass = {\begingroup\calibri}
	\XeTeXinterchartoks \ASCIIclass 0 = {\endgroup}
	\XeTeXinterchartoks \ASCIIclass 4095 = {\endgroup}
	\count255="0000
	\loop\ifnum\count255<"0100
	  \XeTeXcharclass\count255=\ASCIIclass
	  \advance\count255 by 1
	\repeat
}{}

\ExplSyntaxOff

\newfontfamily\calibri{Calibri}

%\renewcommand{\baselinestretch}{1.5}

\fancypagestyle{mystyle}{
	\renewcommand{\headrulewidth}{0pt}
	\fancyfoot[C]{\calibri \thepage}
}

\pagestyle{mystyle}

\newcommand{\oneline}[1]{%
	\newdimen{\namewidth}%
	\setlength{\namewidth}{\widthof{#1}}%
	\ifthenelse{\lengthtest{\namewidth < \textwidth}}%
	{#1}% do nothing if shorter than text width
	{\resizebox{\textwidth}{!}{#1}}% scale down
}

\ExplSyntaxOn
\tl_new:N \l_gentitle_tl
\seq_new:N \l_gentitle_splitline_seq
\NewDocumentCommand{\gentitle}{m m m o}{
	\tl_clear:N \l_gentitle_tl
	\seq_set_split:Nnn \l_gentitle_splitline_seq {\\} {#3}
	\tl_put_right:Nn \l_gentitle_tl {
		\vspace*{0mm}%
		\vspace{-\parskip}
		\vspace{-2\baselineskip} %twice hack to match the size I like

		\begin{center}
		\bgroup\fontsize{\g_vadscript_index_size_dim}{1.5\g_vadscript_index_size_dim}\selectfont\textbf{#1} \\ \egroup
		\bool_if:nTF {\tl_if_blank_p:n {#2} || \tl_if_empty_p:n {#2}}{}{
			\bgroup\fontsize{\g_vadscript_date_size_dim}{1.5\g_vadscript_date_size_dim}\selectfont #2 \\ \egroup
		}
		\bgroup\fontsize{\g_vadscript_title_size_dim}{1.5\g_vadscript_title_size_dim}\selectfont
	}
	\int_step_inline:nn {\seq_count:N \l_gentitle_splitline_seq} {
		\int_compare:nNnTF {##1} = {1} {} {\tl_put_right:Nn \l_gentitle_tl {\\}}
		\tl_put_right:Nx \l_gentitle_tl {\seq_item:Nn \l_gentitle_splitline_seq {##1}}
	}
	\IfValueT {#4} {
		\tl_put_right:Nn \l_gentitle_tl {
			\\ \egroup
			\bgroup\fontsize{\g_vadscript_subtitle_size_dim}{1.5\g_vadscript_subtitle_size_dim}\selectfont
			#4
		}
	}
	\tl_put_right:Nn \l_gentitle_tl {
		\par\egroup
		\end{center}
	}
	\tl_use:N \l_gentitle_tl
}
\ExplSyntaxOff

\newtcolorbox{myfigure}[1][]{height fill, space to=\myspace, valign=center, #1}
\newtcolorbox{mypaddingfigure}[1][]{height = 0.5\textheight, valign=center, #1}

\ExplSyntaxOn
\bool_new:N \g_indialogue_bool
\NewDocumentEnvironment{dialogue}{+b}{
	%just a simple wrap
	\bool_set_true:N \g_indialogue_bool
	#1
}{
	\bool_set_false:N \g_indialogue_bool
}

\str_new:N \l_param_str
\clist_new:N \l_multi_abbreviation_clist
%Second argument is deprecated, just for backward-compatibility and for comment
\NewDocumentEnvironment{sentence}{m o b}{
	\catcode`_ 12\relax
	\clist_clear:N \l_multi_abbreviation_clist
	\str_set:Nx \l_param_str {\tl_trim_spaces:n {#1}}
	\str_if_empty:NTF \l_param_str
		{\begin{description}[style = unboxed, labelsep = 0pt, nosep, leftmargin = 0pt] \item[]}
		{\begin{description}[style = unboxed, labelsep = 0pt, nosep, leftmargin = \widthof{\l_param_str：}] \item[
			{\setlength{\fboxsep}{0pt}
				\l_param_str：
			}
		]}
	#3
}
{
	\end{description}
	\catcode`_ 8\relax
}

\seq_new:N \g_chara_seq
\prop_new:N \g_chara_abbreviation_prop
\prop_new:N \g_chara_precolumn_prop
\prop_new:N \g_chara_postcolumn_prop
\int_new:N \g_chara_precolumn_number_int
\int_new:N \g_chara_postcolumn_number_int
\int_gset:Nn \g_chara_postcolumn_number_int {1} %default one column
\seq_new:N \l_column_seq
\cs_new:Nn \seqlongest:nN {
	\group_begin:
	\seq_set_split:Nnn \l_column_seq {,} {#1}
	\int_set:Nx \l_tmpa_int {\seq_count:N \l_column_seq}
	\int_compare:nNnTF {\l_tmpa_int} > {#2} {
		\int_gset:Nn #2 {\l_tmpa_int}
	}
	\group_end:
}
\NewDocumentCommand{\addchara}{m m o m}{
	% m: character name
	% m: character abbreviation
	% o: pre-name columns
	% m: post-name columns
	\group_begin:
	\str_set:Nx \l_tmpa_str {\tl_trim_spaces:n {#1}}
	\str_set:Nx \l_tmpb_str {\tl_trim_spaces:n {#2}}
	\seq_gput_right:NV \g_chara_seq \l_tmpa_str
	\prop_gput:NVV \g_chara_abbreviation_prop \l_tmpa_str \l_tmpb_str
	%new box
	%ocg deprecated
	%\cs_if_exist:cTF {l_chara_ocg_indicator_\l_tmpa_str _box} {} {
	%	\box_new:c {l_chara_ocg_indicator_\l_tmpa_str _box}
	%}
	%pre-column
	\IfNoValueTF{#3}{
		\prop_gput:NVn \g_chara_precolumn_prop \l_tmpa_str {}
	}{
		\prop_gput:NVn \g_chara_precolumn_prop \l_tmpa_str {#3}
		\seqlongest:nN {#3} \g_chara_precolumn_number_int
	}
	%post-column
	\prop_gput:NVn \g_chara_postcolumn_prop \l_tmpa_str {#4}
	\seqlongest:nN {#4} \g_chara_postcolumn_number_int
	\group_end:
}

\tl_new:N \l_tabular_content_tl
\str_new:N \l_chara_name
\str_new:N \l_chara_abbreviation
\int_new:N \l_total_column_number_int
\cs_generate_variant:Nn \seq_set_split:Nnn {Nnx}
\NewDocumentCommand{\writecast}{o}{
	\group_begin:
	\tl_clear:N \l_tabular_content_tl
	%compute column number
	\int_set:Nn \l_total_column_number_int {\g_chara_precolumn_number_int + 1 + \g_chara_postcolumn_number_int}
	%\bool_if:NTF \g_notailblank_bool {} {\int_incr:N \l_total_column_number_int}
	%put pre environment
	\tl_put_right:Nn \l_tabular_content_tl {
		\autobreakbeforecast
		ＣＡＳＴ
		\begingroup
		\fontsize{\g_vadscript_cast_size_dim}{\g_vadscript_cast_size_dim}\selectfont
		\setcellgapes{1pt} \makegapedcells
		%\begin{tabularx}{\textwidth}{| *{\l_total_column_number_int}{Y|}}\hline
	}
	%give the table preamble
	\IfNoValueTF {#1} {
		\tl_put_right:Nn \l_tabular_content_tl {
			\begin{tabularx}{\textwidth}{| *{\l_total_column_number_int}{Y|}}\hline
		}
	} {
		\tl_put_right:Nn \l_tabular_content_tl {
			\begin{tabularx}{\textwidth}{#1}\hline
		}
	}
	\seq_map_inline:Nn \g_chara_seq {
		%get name
		\str_set:Nx \l_chara_name {##1}
		%get abbreviation
		\prop_get:NVN \g_chara_abbreviation_prop \l_chara_name \l_tmpa_tl
		\str_set:Nx \l_chara_abbreviation {\l_tmpa_tl}
		%get pre-column
		\prop_get:NVN \g_chara_precolumn_prop \l_chara_name \l_tmpa_tl
		\seq_set_split:NnV \l_column_seq {,} \l_tmpa_tl
		\int_step_inline:nn {\g_chara_precolumn_number_int} {
			\tl_set:Nx \l_tmpb_tl {\seq_item:Nn \l_column_seq {####1}}
			\tl_put_right:NV \l_tabular_content_tl \l_tmpb_tl
			\tl_put_right:Nn \l_tabular_content_tl {&}
		}
		%get name
		\tl_clear:N \l_tmpb_tl
		\tl_put_right:Nx \l_tabular_content_tl {\l_chara_name ( \l_chara_abbreviation )}
		%get post-column
		\prop_get:NVN \g_chara_postcolumn_prop \l_chara_name \l_tmpa_tl
		\seq_set_split:NnV \l_column_seq {,} \l_tmpa_tl
		\int_step_inline:nn {\g_chara_postcolumn_number_int} {
			\tl_put_right:Nn \l_tabular_content_tl {&}
			\tl_set:Nx \l_tmpb_tl {\seq_item:Nn \l_column_seq {####1}}
			\tl_put_right:NV \l_tabular_content_tl \l_tmpb_tl
		}
		\tl_put_right:Nn \l_tabular_content_tl {\\ \hline}
	}
	\tl_put_right:Nn \l_tabular_content_tl {\end{tabularx} \endgroup}
	%\tl_show:N \l_tabular_content_tl
	\tl_use:N \l_tabular_content_tl
	%clear chara
	\seq_gclear:N \g_chara_seq
	\prop_gclear:N \g_chara_abbreviation_prop
	\prop_gclear:N \g_chara_precolumn_prop
	\int_gset:Nn \g_chara_precolumn_number_int {0}
	\prop_gclear:N \g_chara_postcolumn_prop
	\int_gset:Nn \g_chara_postcolumn_number_int {1}
	\group_end:
}

\ExplSyntaxOff

\newcolumntype{Y}{>{\centering\arraybackslash}X}
\newcolumntype{Z}{>{\raggedleft\arraybackslash}X}
%\renewcommand{\tabularxcolumn}[1]{m{#1}}

\newcounter{realpage}
\DeclareAssociatedCounters{page}{realpage}
\AtBeginDocument{%
	\stepcounter{realpage}
}

\ExplSyntaxOn
\newlength\wordwidth
\newlength\wordheight
\NewDocumentCommand{\ruleline}{O{}}{
	\str_set:Nn \l_param_str {#1}
	\str_if_empty:NTF \l_param_str
	{
		\setlength\wordheight{\heightof{我}} %dummy word
		\raisebox {0.5\wordheight} {
			\makebox[\linewidth]{\hrulefill}
		}
	}{
		\setlength\wordheight{\heightof{#1}}
		\raisebox {0.5\wordheight} {
			\makebox[\linewidth]{\hrulefill \raisebox{-0.5\wordheight}{#1} \hrulefill}
		}
	}
}
\NewDocumentEnvironment{inrule}{b}{\ruleline[#1]}{}
\NewDocumentEnvironment{incenter}{b}{\bgroup\centering #1}{\par\egroup}
\NewDocumentCommand{\autobreakbeforecast}{}{
	\dim_compare:nNnTF {\textheight - \pagetotal} < {\textheight / 7} {\newpage} {\mbox{}\\}
}
\seq_new:N \l_images_seq
\int_new:N \l_pageremfour_int
\int_new:N \l_image_to_insert_int
\NewDocumentCommand{\picturefullpagepadding}{m}{
	\seq_set_split:Nnn \l_images_seq {,} {#1}
	\seq_remove_all:Nn \l_images_seq {} %remove empty items
	\seq_map_inline:Nn \l_images_seq {
		\begin{figure}[b]
		\adjustimage{max~width = \textwidth, max~height = \textheight, keepaspectratio}{##1}
		\end{figure}
	}
}
\NewDocumentCommand{\picturepadding}{m}{
	\group_begin:
	\bool_set_false:N \l_tmpa_bool
	\bool_set_false:N \l_tmpb_bool
	\seq_set_split:Nnn \l_images_seq {,} {#1}
	\seq_remove_all:Nn \l_images_seq {} %remove empty items
	\int_set:Nn \l_pageremfour_int {\int_mod:nn {\value{realpage}} {4}}
	\bool_if:NTF \g_image_use_all_b {
		\int_set:Nn \l_image_to_insert_int {\seq_count:N \l_images_seq}
	}{
		\int_compare:nNnTF {\l_pageremfour_int} = {0} {
			\dim_compare:nNnTF {\textheight - \pagetotal} < {0.49\textheight}{
				\int_set:Nn \l_image_to_insert_int {0}
			}{
				\int_set:Nn \l_image_to_insert_int {1}
			}
		}{
		% Use 0.5 to compute height, but use 0.49 to 
			\dim_compare:nNnTF {\textheight - \pagetotal} < {0.49\textheight}{
				\int_set:Nn \l_image_to_insert_int {(4 - \l_pageremfour_int) * 2}
			}{
				\int_set:Nn \l_image_to_insert_int {(4 - \l_pageremfour_int) * 2 + 1}
			}
		}
	}
	\seq_map_inline:Nn \l_images_seq {
		\int_compare:nNnTF {\l_image_to_insert_int} = {0} {\seq_map_break:} {}
		\int_compare:nNnTF {\int_mod:nn {\l_image_to_insert_int} {2}} = {0} {
			%\int_show:N \l_image_to_insert_int
			\newpage
			\begin{figure}[t]
		}{
			\bool_if:NTF \l_tmpa_bool {
			\begin{figure}[b]
			}{ %if this is the first picture and trying to put it in bottom
			\bool_set_true:N \l_tmpb_bool %use tmpb to keep trace of myfigure
			\begin{myfigure}[blanker]
			}
		}
			\centering
			\adjustimage{max~width = \textwidth, max~height = 0.49\textheight, keepaspectratio}{##1}
			\bool_if:NTF \l_tmpb_bool {
			\end{myfigure}
				\bool_set_false:N \l_tmpb_bool
			}{
			\end{figure}
			}

		\int_decr:N \l_image_to_insert_int
		\bool_set_true:N \l_tmpa_bool
	}
	\group_end:
}
\ExplSyntaxOff

\setstretch{1.5}
\setlength{\parindent}{0pt}